export interface BloodMarkerData {
  markerCode: string
  markerName: string
  value: number
  unit: string
  refMin?: number
  refMax?: number
}

export interface BloodPanelImport {
  panelDate: string
  labName?: string
  markers: BloodMarkerData[]
}

// Parse CSV format: marker_code, marker_name, value, unit, ref_min, ref_max
export function parseBloodPanelCSV(csvContent: string): BloodPanelImport {
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

  const markers: BloodMarkerData[] = []
  let panelDate = new Date().toISOString().split('T')[0]
  let labName = 'Manuel'

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue

    const values = lines[i].split(',').map(v => v.trim())
    const row: Record<string, string> = {}

    headers.forEach((header, idx) => {
      row[header] = values[idx] || ''
    })

    if (row['marker_code'] && row['value']) {
      markers.push({
        markerCode: row['marker_code'],
        markerName: row['marker_name'] || row['marker_code'],
        value: parseFloat(row['value']),
        unit: row['unit'] || '',
        refMin: row['ref_min'] ? parseFloat(row['ref_min']) : undefined,
        refMax: row['ref_max'] ? parseFloat(row['ref_max']) : undefined,
      })
    }
  }

  if (markers.length === 0) {
    throw new Error('Aucun marqueur trouvé dans le fichier CSV')
  }

  return {
    panelDate,
    labName,
    markers,
  }
}

// Validate blood panel data
export function validateBloodPanel(panel: BloodPanelImport): string[] {
  const errors: string[] = []

  if (!panel.panelDate) {
    errors.push('Date du bilan manquante')
  }

  if (!Array.isArray(panel.markers) || panel.markers.length === 0) {
    errors.push('Au moins un marqueur requis')
  }

  panel.markers.forEach((marker, idx) => {
    if (!marker.markerCode || !marker.markerName) {
      errors.push(`Marqueur ${idx + 1}: code ou nom manquant`)
    }
    if (!marker.value || isNaN(marker.value)) {
      errors.push(`Marqueur ${idx + 1}: valeur invalide`)
    }
    if (!marker.unit) {
      errors.push(`Marqueur ${idx + 1}: unité manquante`)
    }
  })

  return errors
}

// Detect marker status based on reference values
export function getMarkerStatus(
  value: number,
  refMin?: number,
  refMax?: number,
): 'optimal' | 'warning' | 'danger' | 'low_normal' | 'high_normal' | null {
  if (refMin === undefined || refMax === undefined) return null

  if (value < refMin) return 'low_normal'
  if (value > refMax) return 'high_normal'
  return 'optimal'
}
