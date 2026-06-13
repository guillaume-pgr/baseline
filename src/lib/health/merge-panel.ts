/**
 * Dédup / merge déterministe d'un bilan daté — ZÉRO appel API, ZÉRO I/O.
 *
 * Décide quels marqueurs insérer dans un bilan (utilisateur, date) déjà existant
 * SANS jamais écraser : un (marqueur, date) déjà présent est conservé tel quel ;
 * si la valeur diffère, c'est un CONFLIT (signalé, pas écrasé). Séparé de la
 * route d'écriture pour être testable hors-ligne.
 */

import type { BloodMarkerData } from './blood-panel-parser'

// Code d'identité d'un marqueur dans un bilan (clé de dédup).
export const markerCodeOf = (m: BloodMarkerData) => m.markerCode || m.markerName

// Égalité tolérante (arrondis d'affichage) — sinon faux conflits sur 1.0 vs 1.00.
export function valuesDiffer(a: number, b: number): boolean {
  if (a === b) return false
  const scale = Math.max(Math.abs(a), Math.abs(b), 1)
  return Math.abs(a - b) / scale >= 0.005
}

export interface MarkerConflict {
  marker: string
  existing: number
  incoming: number
}

export interface MergePlan {
  toInsert: BloodMarkerData[]
  conflicts: MarkerConflict[]
}

/**
 * Étant donné les marqueurs déjà présents (code → valeur) et les marqueurs
 * entrants, renvoie ceux à insérer (absents) et les conflits (présents mais
 * valeur divergente). Ne renvoie JAMAIS d'écrasement.
 */
export function planMarkerMerge(
  existingByCode: Map<string, number>,
  incoming: BloodMarkerData[],
): MergePlan {
  const toInsert: BloodMarkerData[] = []
  const conflicts: MarkerConflict[] = []
  for (const m of incoming) {
    const code = markerCodeOf(m)
    if (!existingByCode.has(code)) {
      toInsert.push(m)
    } else if (valuesDiffer(existingByCode.get(code)!, m.value)) {
      conflicts.push({ marker: m.markerName, existing: existingByCode.get(code)!, incoming: m.value })
    }
    // présent + même valeur → ignoré (rien à faire)
  }
  return { toInsert, conflicts }
}
