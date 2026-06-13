/**
 * Regroupement déterministe des marqueurs réconciliés en bilans datés — ZÉRO appel API.
 *
 * Le bilan du JOUR (date de prélèvement) + un bilan par DATE d'antériorité
 * distincte (les antériorités héritent unité/intervalle/explication du marqueur
 * du jour). Séparé de la route d'extraction pour être testable hors-ligne :
 * c'est le cœur de la feature multi-dates, déjà cassé une fois.
 */

import { verifyMarkers, type VerifiedMarker } from './verify'
import type { ReconciledMarker } from './reconcile'

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
  const { markers, globalConfidence } = verifyMarkers(reconciledMarkers, pdfText)

  // Chaque valeur d'antériorité (marqueur, date) → marqueur d'un bilan daté
  // distinct, héritant tout du marqueur du jour (unité, bornes, explication).
  const priorByDate = new Map<string, ReconciledMarker[]>()
  for (const m of reconciledMarkers) {
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
