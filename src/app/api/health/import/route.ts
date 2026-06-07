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
type ImportBody = BloodPanelImport & {
  extractionMeta?: ExtractionMeta
  corrections?: Correction[]
}

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

    const bloodPanel = (await request.json()) as ImportBody

    const validationErrors = validateBloodPanel(bloodPanel)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Erreur de validation: ' + validationErrors.join(', ') },
        { status: 400 },
      )
    }

    console.log('[api/health/import] saving', bloodPanel.markers.length, 'markers for profile', gate.profileId)

    // Create the panel record.
    // Supabase's generated Insert type collapses to `never` here, so we cast —
    // same workaround used across this codebase's Supabase calls.
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const { data: panel, error: panelError } = await (supabase
      .from('blood_panels')
      .insert({
        profile_id: gate.profileId,
        panel_date: bloodPanel.panelDate,
        lab_name: bloodPanel.labName || 'Laboratoire',
        raw_extraction: { markers: bloodPanel.markers },
        validated_at: new Date().toISOString(),
      } as any)
      .select()
      .single() as any)

    if (panelError || !panel) {
      console.error('[api/health/import] panel insert error:', panelError)
      throw panelError ?? new Error('Insertion du bilan échouée')
    }

    // Insert markers
    const markersToInsert = bloodPanel.markers.map(marker => ({
      panel_id: panel.id,
      marker_code: marker.markerCode || marker.markerName,
      marker_name: marker.markerName,
      value: marker.value,
      unit: marker.unit,
      ref_min: marker.refMin ?? null,
      ref_max: marker.refMax ?? null,
      organ_system: marker.organSystem ?? null,
      status: toDbStatus(getMarkerStatus(marker.value, marker.refMin, marker.refMax)),
    }))

    const { error: markersError } = await (supabase
      .from('blood_markers')
      .insert(markersToInsert as any) as any)
    /* eslint-enable @typescript-eslint/no-explicit-any */

    if (markersError) {
      console.error('[api/health/import] markers insert error:', markersError)
      throw markersError
    }

    console.log('[api/health/import] success, inserted', markersToInsert.length, 'markers')

    // ─── Boucle d'apprentissage (sous-étape F) — best-effort, ne casse jamais
    //     l'import si le logging échoue. ───────────────────────────────────────
    try {
      const meta = bloodPanel.extractionMeta
      /* eslint-disable @typescript-eslint/no-explicit-any */
      await (supabase.from('extraction_logs').insert({
        user_id: user.id,
        lab_name: bloodPanel.labName || null,
        markers_count: markersToInsert.length,
        low_confidence_count: meta?.lowConfidenceCount ?? 0,
        unmatched_markers: meta?.unmatchedMarkers ?? [],
        global_confidence: meta?.globalConfidence ?? null,
        model: meta?.model ?? null,
      } as any) as any)

      const corrections = (bloodPanel.corrections ?? []).filter(c => c.raw_name)
      if (corrections.length > 0) {
        await (supabase.from('extraction_corrections').insert(
          corrections.map(c => ({
            user_id: user.id,
            raw_name: c.raw_name,
            corrected_canonical: c.corrected_canonical ?? null,
            raw_unit: c.raw_unit ?? null,
            corrected_unit: c.corrected_unit ?? null,
            lab_name: bloodPanel.labName || null,
          })) as any,
        ) as any)
      }
      /* eslint-enable @typescript-eslint/no-explicit-any */
    } catch (logErr) {
      console.warn('[api/health/import] learning-loop logging skipped:', logErr instanceof Error ? logErr.message : logErr)
    }

    return NextResponse.json({
      success: true,
      panel: panel.id,
      markersCount: markersToInsert.length,
    })
  } catch (error) {
    console.error('[api/health/import] error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 },
    )
  }
}
