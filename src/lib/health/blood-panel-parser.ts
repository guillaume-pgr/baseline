export interface BloodMarkerData {
  markerCode: string
  markerName: string
  value: number
  unit: string
  refMin?: number | null
  refMax?: number | null
  organSystem?: string | null
  explanation?: string | null
  // true when the marker was not found in the local reference (MODIF 2) —
  // its unit/thresholds may need a manual touch in the review screen.
  needsReview?: boolean
}

export interface BloodPanelImport {
  panelDate: string
  labName?: string
  markers: BloodMarkerData[]
}

// Valid organ systems — kept in sync with realDataAdapter GROUP_COLORS
export const ORGAN_SYSTEMS = [
  'hematologie',
  'lipides',
  'glucides',
  'foie',
  'reins',
  'thyroide',
  'vitamines',
  'mineraux',
  'inflammation',
  'autres',
] as const

// Validate a blood panel before saving (used by the import route)
export function validateBloodPanel(panel: BloodPanelImport): string[] {
  const errors: string[] = []

  if (!panel.panelDate) {
    errors.push('Date du bilan manquante')
  }

  if (!Array.isArray(panel.markers) || panel.markers.length === 0) {
    errors.push('Au moins un marqueur requis')
    return errors
  }

  panel.markers.forEach((marker, idx) => {
    if (!marker.markerName) {
      errors.push(`Marqueur ${idx + 1}: nom manquant`)
    }
    if (marker.value === null || marker.value === undefined || isNaN(marker.value)) {
      errors.push(`Marqueur ${idx + 1}: valeur invalide`)
    }
    if (!marker.unit) {
      errors.push(`Marqueur ${idx + 1}: unité manquante`)
    }
  })

  return errors
}

// Statut des marqueurs : voir src/lib/health/marker-status.ts (source unique).
