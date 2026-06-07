/**
 * Réconciliation déterministe des marqueurs extraits (sous-étape C) — ZÉRO appel API.
 *
 * Transforme la sortie brute du modèle (RawExtraction) en marqueurs propres,
 * en unité conventionnelle, dédoublonnés, complétés depuis le référentiel local.
 */

import {
  matchMarker,
  convertToCanonical,
  normalizeNumber,
  normalizeUnit,
  normalizeName,
  boundsForSex,
  type RefOperator,
} from './blood-markers-reference'

// ─── Schéma brut (sortie du modèle, sous-étape B) ────────────────────────────

export interface RawMarker {
  raw_name: string
  value: number | null
  raw_unit: string | null
  ref_low: number | null
  ref_high: number | null
  ref_operator: RefOperator
  secondary_value: number | null
  secondary_unit: string | null
  section: string | null
  confidence: number
  is_patient_value: boolean
}

export interface RawExtraction {
  metadata: {
    lab_name: string | null
    collection_date: string | null
    report_date: string | null
    patient_sex: 'M' | 'F' | null
    patient_age: number | null
  }
  markers: RawMarker[]
}

// ─── Marqueur réconcilié (consommé par l'UI / la sauvegarde) ─────────────────

export interface ReconciledMarker {
  markerCode: string
  markerName: string // canonique si reconnu, sinon nom brut
  rawName: string
  value: number
  rawValue: number // valeur normalisée AVANT conversion (pour la vérif texte, sous-étape D)
  unit: string // unité conventionnelle
  refMin: number | null
  refMax: number | null
  refOperator: RefOperator
  organSystem: string | null
  explanation: string | null
  secondaryValue: number | null
  secondaryUnit: string | null
  confidence: number
  converted: boolean // l'unité/valeur a été convertie depuis l'unité du labo
  needsReview: boolean // absent du référentiel
}

export interface ReconciledPanel {
  panelDate: string
  labName: string
  patientSex: 'M' | 'F' | null
  markers: ReconciledMarker[]
}

// Lignes à exclure systématiquement (témoins, redondances, qualitatif).
const HARD_EXCLUDE = new Set([
  'temps de quick du temoin',
  'temps de quick du patient', // redondant avec le Taux de prothrombine (TP)
  'temoin',
  'turbidite',
  'aspect',
  'couleur',
])

function toIsoDate(s: string | null): string {
  const today = new Date().toISOString().split('T')[0]
  if (!s) return today
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const t = Date.parse(s)
  return Number.isFinite(t) ? new Date(t).toISOString().split('T')[0] : today
}

/**
 * Réconcilie une extraction brute en panel propre :
 * normalisation des nombres, matching référentiel, conversion d'unités vers le
 * conventionnel, complétion des bornes (sexe pris en compte), dédoublonnage,
 * exclusions, marquage needs_review pour l'inconnu.
 */
export function reconcileExtraction(raw: RawExtraction): ReconciledPanel {
  const meta = raw.metadata ?? { lab_name: null, collection_date: null, report_date: null, patient_sex: null, patient_age: null }
  const sex = meta.patient_sex === 'M' || meta.patient_sex === 'F' ? meta.patient_sex : null

  const reconciled: ReconciledMarker[] = []

  for (const m of raw.markers) {
    if (!m || !m.raw_name) continue
    if (m.is_patient_value === false) continue

    const nameKey = normalizeName(m.raw_name)
    if (HARD_EXCLUDE.has(nameKey)) continue

    const value = normalizeNumber(m.value)
    if (value === null) continue // qualitatif non converti → ignoré

    const secondaryValueRaw = normalizeNumber(m.secondary_value)
    const ref = matchMarker(m.raw_name)

    if (!ref) {
      // Inconnu du référentiel : on garde tel quel, à compléter manuellement (rare).
      reconciled.push({
        markerCode: '',
        markerName: m.raw_name.trim(),
        rawName: m.raw_name.trim(),
        value,
        rawValue: value,
        unit: normalizeUnit(m.raw_unit),
        refMin: m.ref_low,
        refMax: m.ref_high,
        refOperator: m.ref_operator ?? 'none',
        organSystem: null,
        explanation: null,
        secondaryValue: secondaryValueRaw,
        secondaryUnit: m.secondary_unit,
        confidence: m.confidence ?? 0.5,
        converted: false,
        needsReview: true,
      })
      continue
    }

    // Conversion valeur + bornes vers l'unité canonique/conventionnelle.
    const conv = convertToCanonical(value, m.raw_unit, ref)
    const lowConv = m.ref_low !== null ? convertToCanonical(m.ref_low, m.raw_unit, ref).value : null
    const highConv = m.ref_high !== null ? convertToCanonical(m.ref_high, m.raw_unit, ref).value : null

    // Bornes : extraites si présentes, sinon référentiel (selon le sexe).
    const hasExtractedBounds = m.ref_low !== null || m.ref_high !== null
    let refMin: number | null
    let refMax: number | null
    let refOperator: RefOperator
    if (hasExtractedBounds) {
      refMin = lowConv
      refMax = highConv
      refOperator = m.ref_operator ?? 'range'
    } else {
      const b = boundsForSex(ref, sex)
      refMin = b.low
      refMax = b.high
      refOperator = ref.refOperator
    }

    reconciled.push({
      markerCode: '',
      markerName: ref.canonical,
      rawName: m.raw_name.trim(),
      value: conv.value as number,
      rawValue: value,
      unit: conv.unit,
      refMin,
      refMax,
      refOperator,
      organSystem: ref.category,
      explanation: ref.explanation,
      secondaryValue: secondaryValueRaw,
      secondaryUnit: m.secondary_unit ? normalizeUnit(m.secondary_unit) : null,
      confidence: m.confidence ?? 0.8,
      converted: conv.converted,
      needsReview: false,
    })
  }

  // Dédoublonnage : deux lignes résolvant au MÊME canonique → fusion (la moins
  // confiante devient secondary). Les inconnus ne sont jamais fusionnés.
  const byCanonical = new Map<string, ReconciledMarker>()
  const out: ReconciledMarker[] = []
  for (const rm of reconciled) {
    if (rm.needsReview) { out.push(rm); continue }
    const existing = byCanonical.get(rm.markerName)
    if (!existing) {
      byCanonical.set(rm.markerName, rm)
      out.push(rm)
      continue
    }
    const primary = rm.confidence > existing.confidence ? rm : existing
    const other = primary === rm ? existing : rm
    if (primary.secondaryValue === null && other.value !== null) {
      primary.secondaryValue = other.value
      primary.secondaryUnit = other.unit
    }
    if (primary !== existing) {
      const idx = out.indexOf(existing)
      if (idx >= 0) out[idx] = primary
      byCanonical.set(rm.markerName, primary)
    }
  }

  return {
    panelDate: toIsoDate(meta.collection_date),
    labName: meta.lab_name || 'Laboratoire',
    patientSex: sex,
    markers: out,
  }
}
