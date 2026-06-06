import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkBloodPanelGate } from '@/lib/health/gating'
import {
  validateBloodPanel,
  getMarkerStatus,
  type BloodPanelImport,
} from '@/lib/health/blood-panel-parser'

// Saves a validated blood panel (markers already extracted & reviewed by the user).
// Body: { panelDate, labName, markers: BloodMarkerData[] }
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

    const bloodPanel = (await request.json()) as BloodPanelImport

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
      status: getMarkerStatus(marker.value, marker.refMin, marker.refMax),
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
