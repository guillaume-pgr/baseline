import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkBloodPanelGate } from '@/lib/health/gating'
import { validateBloodPanel, type BloodPanelImport } from '@/lib/health/blood-panel-parser'
import { getMarkerStatus, toDbStatus } from '@/lib/health/marker-status'

// Learning-loop payload (sous-étape F) — optional, best-effort logging.
interface ExtractionMeta {
  globalConfidence?: number | null
  model?: string | null
  lowConfidenceCount?: number
  unmatchedMarkers?: string[]
}
interface Correction {
  raw_name: string
  corrected_canonical?: string | null
  raw_unit?: string | null
  corrected_unit?: string | null
}
interface ImportPanelInput {
  panelDate: string
  markers: BloodPanelImport['markers']
}

// Nouveau format multi-bilans : { labName, panels: [{ panelDate, markers }] }.
// Ancien format mono-bilan ({ panelDate, markers }) toujours accepté (rétro-compat).
type ImportBody = Partial<BloodPanelImport> & {
  labName?: string
  panels?: ImportPanelInput[]
  extractionMeta?: ExtractionMeta
  corrections?: Correction[]
}

// Égalité tolérante (arrondis d'affichage) pour détecter un conflit de valeur.
function valuesDiffer(a: number, b: number): boolean {
  if (a === b) return false
  const scale = Math.max(Math.abs(a), Math.abs(b), 1)
  return Math.abs(a - b) / scale >= 0.005
}

const markerCodeOf = (m: BloodPanelImport['markers'][number]) => m.markerCode || m.markerName

// Saves a validated blood panel (markers already extracted & reviewed by the user).
// Body: { panelDate, labName, markers: BloodMarkerData[], extractionMeta?, corrections? }
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Gating (authoritative)
    const gate = await checkBloodPanelGate(supabase, user)
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status })
    }

    const body = (await request.json()) as ImportBody
    const labName = body.labName || 'Laboratoire'

    // Normalise vers une liste de bilans (rétro-compat mono-bilan).
    const panels: ImportPanelInput[] = body.panels
      ?? (body.panelDate && body.markers ? [{ panelDate: body.panelDate, markers: body.markers }] : [])

    if (panels.length === 0) {
      return NextResponse.json({ error: 'Aucun bilan à enregistrer' }, { status: 400 })
    }

    // Valide chaque bilan indépendamment.
    for (const p of panels) {
      const errs = validateBloodPanel({ panelDate: p.panelDate, labName, markers: p.markers })
      if (errs.length > 0) {
        return NextResponse.json(
          { error: `Bilan du ${p.panelDate} : ${errs.join(', ')}` },
          { status: 400 },
        )
      }
    }

    const buildRow = (panelId: string, marker: BloodPanelImport['markers'][number]) => ({
      panel_id: panelId,
      marker_code: markerCodeOf(marker),
      marker_name: marker.markerName,
      value: marker.value,
      unit: marker.unit,
      ref_min: marker.refMin ?? null,
      ref_max: marker.refMax ?? null,
      organ_system: marker.organSystem ?? null,
      status: toDbStatus(getMarkerStatus(marker.value, marker.refMin, marker.refMax)),
    })

    let panelsCreated = 0
    let panelsMerged = 0
    let markersInserted = 0
    const conflicts: { date: string; marker: string; existing: number; incoming: number }[] = []

    console.log('[api/health/import] saving', panels.length, 'panel(s) for profile', gate.profileId)

    // Supabase's generated Insert type collapses to `never` → cast (pattern repo).
    /* eslint-disable @typescript-eslint/no-explicit-any */
    for (const p of panels) {
      // Dédup par (profil, date) : le bilan existe-t-il déjà ?
      const { data: existingPanels } = await (supabase
        .from('blood_panels')
        .select('id')
        .eq('profile_id', gate.profileId)
        .eq('panel_date', p.panelDate)
        .limit(1) as any)
      const existing = existingPanels?.[0]

      if (!existing) {
        // Bilan absent → créer le bilan + tous ses marqueurs.
        const { data: panel, error: panelError } = await (supabase
          .from('blood_panels')
          .insert({
            profile_id: gate.profileId,
            panel_date: p.panelDate,
            lab_name: labName,
            raw_extraction: { markers: p.markers },
            validated_at: new Date().toISOString(),
          } as any)
          .select()
          .single() as any)

        if (panelError || !panel) {
          console.error('[api/health/import] panel insert error:', panelError)
          throw panelError ?? new Error('Insertion du bilan échouée')
        }

        const rows = p.markers.map(m => buildRow(panel.id, m))
        const { error: markersError } = await (supabase.from('blood_markers').insert(rows as any) as any)
        if (markersError) {
          console.error('[api/health/import] markers insert error:', markersError)
          throw markersError
        }
        panelsCreated++
        markersInserted += rows.length
      } else {
        // Bilan présent → MERGE : insérer uniquement les marqueurs manquants.
        // Un (marqueur, date) déjà présent n'est PAS écrasé ; si la valeur diffère,
        // on le signale (conflits) au lieu d'écraser silencieusement.
        const { data: existingMarkers } = await (supabase
          .from('blood_markers')
          .select('marker_code, value')
          .eq('panel_id', existing.id) as any)
        const existingByCode = new Map<string, number>(
          (existingMarkers ?? []).map((em: any) => [em.marker_code, Number(em.value)]),
        )

        const rows: ReturnType<typeof buildRow>[] = []
        for (const m of p.markers) {
          const code = markerCodeOf(m)
          if (!existingByCode.has(code)) {
            rows.push(buildRow(existing.id, m))
          } else if (valuesDiffer(existingByCode.get(code)!, m.value)) {
            conflicts.push({ date: p.panelDate, marker: m.markerName, existing: existingByCode.get(code)!, incoming: m.value })
          }
        }

        if (rows.length > 0) {
          const { error: mergeError } = await (supabase.from('blood_markers').insert(rows as any) as any)
          if (mergeError) {
            console.error('[api/health/import] merge insert error:', mergeError)
            throw mergeError
          }
          markersInserted += rows.length
        }
        panelsMerged++
      }
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */

    console.log('[api/health/import] success —', panelsCreated, 'créé(s),', panelsMerged, 'fusionné(s),', markersInserted, 'marqueurs insérés,', conflicts.length, 'conflit(s)')

    // ─── Boucle d'apprentissage (sous-étape F) — best-effort, ne casse jamais
    //     l'import si le logging échoue. ───────────────────────────────────────
    try {
      const meta = body.extractionMeta
      /* eslint-disable @typescript-eslint/no-explicit-any */
      await (supabase.from('extraction_logs').insert({
        user_id: user.id,
        lab_name: labName,
        markers_count: markersInserted,
        low_confidence_count: meta?.lowConfidenceCount ?? 0,
        unmatched_markers: meta?.unmatchedMarkers ?? [],
        global_confidence: meta?.globalConfidence ?? null,
        model: meta?.model ?? null,
      } as any) as any)

      const corrections = (body.corrections ?? []).filter(c => c.raw_name)
      if (corrections.length > 0) {
        await (supabase.from('extraction_corrections').insert(
          corrections.map(c => ({
            user_id: user.id,
            raw_name: c.raw_name,
            corrected_canonical: c.corrected_canonical ?? null,
            raw_unit: c.raw_unit ?? null,
            corrected_unit: c.corrected_unit ?? null,
            lab_name: labName,
          })) as any,
        ) as any)
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
    } catch (logErr) {
      console.warn('[api/health/import] learning-loop logging skipped:', logErr instanceof Error ? logErr.message : logErr)
    }

    return NextResponse.json({
      success: true,
      panelsCreated,
      panelsMerged,
      markersCount: markersInserted,
      conflicts,
    })
  } catch (error) {
    console.error('[api/health/import] error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 },
    )
  }
}
