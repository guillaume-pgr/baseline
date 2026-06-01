import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { parseBloodPanelCSV, validateBloodPanel, getMarkerStatus } from '@/lib/health/blood-panel-parser'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier sélectionné' }, { status: 400 })
    }

    console.log('[api/health/import] processing file:', file.name, file.type)

    // Read file content
    const fileContent = await file.text()

    // Parse based on file type
    let bloodPanel
    if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      bloodPanel = parseBloodPanelCSV(fileContent)
    } else {
      return NextResponse.json(
        { error: 'Format non supporté. Accepte CSV.' },
        { status: 400 },
      )
    }

    // Validate
    const validationErrors = validateBloodPanel(bloodPanel)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Erreur de validation: ' + validationErrors.join(', ') },
        { status: 400 },
      )
    }

    console.log('[api/health/import] validated, saving to Supabase...')

    // Get current user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single() as any

    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    // Create blood panel record
    const panelResult = await (supabase
      .from('blood_panels')
      .insert({
        profile_id: profile.id,
        panel_date: bloodPanel.panelDate,
        lab_name: bloodPanel.labName || 'Manuel',
        validated_at: new Date().toISOString(),
      } as any)
      .select()
      .single() as any)

    const panel = panelResult.data
    const panelError = panelResult.error

    if (panelError) {
      console.error('[api/health/import] panel insert error:', panelError)
      throw panelError
    }

    console.log('[api/health/import] panel created:', panel.id)

    // Insert markers
    const markersToInsert = bloodPanel.markers.map(marker => ({
      panel_id: panel.id,
      marker_code: marker.markerCode,
      marker_name: marker.markerName,
      value: marker.value,
      unit: marker.unit,
      ref_min: marker.refMin,
      ref_max: marker.refMax,
      status: getMarkerStatus(marker.value, marker.refMin, marker.refMax),
    }))

    const markersResult = await (supabase
      .from('blood_markers')
      .insert(markersToInsert as any) as any)

    const markersError = markersResult.error

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
