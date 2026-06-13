/**
 * Regroupement déterministe des marqueurs réconciliés en bilans datés — ZÉRO appel API.
 *
 * Le bilan du JOUR (date de prélèvement) + un bilan par DATE d'antériorité
 * distincte (les antériorités héritent unité/intervalle/explication du marqueur
 * du jour). Séparé de la route d'extraction pour être testable hors-ligne :
 * c'est le cœur de la feature multi-dates, déjà cassé une fois.
 */

import { verifyMarkers, type VerifiedMarker } from './verify'
import type { ReconciledMarker, PriorValue } from './reconcile'

export interface DatedPanel {
  date: string
  isPrimary: boolean
  markers: VerifiedMarker[]
}

export interface GroupedPanels {
  panels: DatedPanel[]
  globalConfidence: number
}

/**
 * Anti fan-out : une valeur d'antériorité appartient à UNE seule colonne (date).
 * Si l'extraction a rattaché la MÊME valeur à plusieurs dates pour un marqueur
 * (ex. un en-tête de date propre à une autre section qui « fuit »), on ne garde
 * qu'UNE occurrence — celle dont la date est la plus partagée par les autres
 * marqueurs (la vraie colonne d'antériorité commune), puis la plus récente.
 *
 * INVARIANT : un marqueur produit exactement autant de mesures qu'il a de
 * colonnes de valeur DISTINCTES — jamais de duplication d'une valeur sur 2 dates.
 */
function dedupePriorFanOut(markers: ReconciledMarker[]): ReconciledMarker[] {
  // Fréquence de chaque date d'antériorité sur l'ensemble des marqueurs.
  const dateFreq = new Map<string, number>()
  for (const m of markers) {
    for (const pv of m.priorValues) dateFreq.set(pv.date, (dateFreq.get(pv.date) ?? 0) + 1)
  }

  return markers.map(m => {
    if (m.priorValues.length < 2) return m

    // Regroupe les antériorités par valeur. Une valeur portée par >1 date = fan-out.
    const byValue = new Map<number, PriorValue[]>()
    for (const pv of m.priorValues) {
      if (!byValue.has(pv.rawValue)) byValue.set(pv.rawValue, [])
      byValue.get(pv.rawValue)!.push(pv)
    }

    const cleaned: PriorValue[] = []
    for (const group of byValue.values()) {
      if (group.length === 1) { cleaned.push(group[0]); continue }
      // Garde la date la plus partagée (vraie colonne commune), puis la plus récente.
      const best = [...group].sort((a, b) =>
        ((dateFreq.get(b.date) ?? 0) - (dateFreq.get(a.date) ?? 0)) || b.date.localeCompare(a.date),
      )[0]
      cleaned.push(best)
    }
    // Dates décroissantes (cohérent avec l'ordre des bilans).
    cleaned.sort((a, b) => b.date.localeCompare(a.date))
    return { ...m, priorValues: cleaned }
  })
}

/**
 * Construit les bilans datés à partir des marqueurs réconciliés du jour.
 * - 1 bilan « du jour » (isPrimary) à `panelDate`.
 * - 1 bilan par date d'antériorité distincte (peut être PARTIEL, ex. HbA1c seule).
 * Un PDF sans antériorité produit donc toujours exactement 1 bilan.
 */
export function groupIntoDatedPanels(
  reconciledMarkers: ReconciledMarker[],
  panelDate: string,
  pdfText: string,
): GroupedPanels {
  // Retire d'abord les fan-out d'antériorité (valeur dupliquée sur plusieurs dates).
  const cleanMarkers = dedupePriorFanOut(reconciledMarkers)

  const { markers, globalConfidence } = verifyMarkers(cleanMarkers, pdfText)

  // Chaque valeur d'antériorité (marqueur, date) → marqueur d'un bilan daté
  // distinct, héritant tout du marqueur du jour (unité, bornes, explication).
  const priorByDate = new Map<string, ReconciledMarker[]>()
  for (const m of cleanMarkers) {
    for (const pv of m.priorValues) {
      if (pv.date === panelDate) continue // même date que le bilan du jour
      if (!priorByDate.has(pv.date)) priorByDate.set(pv.date, [])
      priorByDate.get(pv.date)!.push({
        ...m,
        value: pv.value,
        rawValue: pv.rawValue,
        // Antériorité plus risquée → légère pénalité ; priorColumn relève le seuil.
        confidence: Math.min(m.confidence, 0.9),
        priorValues: [],
      })
    }
  }

  const priorPanels: DatedPanel[] = [...priorByDate.entries()]
    .sort((a, b) => b[0].localeCompare(a[0])) // dates décroissantes
    .map(([date, ms]) => ({
      date,
      isPrimary: false,
      markers: verifyMarkers(ms, pdfText, { priorColumn: true }).markers,
    }))

  return {
    panels: [{ date: panelDate, isPrimary: true, markers }, ...priorPanels],
    globalConfidence,
  }
}
