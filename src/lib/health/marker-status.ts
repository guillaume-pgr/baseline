/**
 * Statut d'un marqueur — fonction UNIQUE et déterministe (zéro appel API).
 *
 * Source d'autorité pour : le point de position, le badge de section, les puces
 * et le total du résumé. Gère correctement les seuils unilatéraux (lt/gt) —
 * c'est précisément ce qui était inversé/ignoré auparavant.
 */

import type { RefOperator } from './blood-markers-reference'

export type MarkerStatus = 'optimal' | 'out_low' | 'out_high' | 'unrated'

/**
 * Déduit l'opérateur à partir des bornes disponibles (quand il n'est pas stocké) :
 *  - low + high → 'range'
 *  - high seul  → 'lt' (doit être inférieur à high)
 *  - low seul   → 'gt' (doit être supérieur à low)
 *  - aucun      → 'none'
 */
export function inferOperator(refLow: number | null | undefined, refHigh: number | null | undefined): RefOperator {
  const hasLow = refLow !== null && refLow !== undefined
  const hasHigh = refHigh !== null && refHigh !== undefined
  if (hasLow && hasHigh) return 'range'
  if (!hasLow && hasHigh) return 'lt'
  if (hasLow && !hasHigh) return 'gt'
  return 'none'
}

/**
 * Statut d'un marqueur selon ses bornes et son opérateur.
 * - 'range' : optimal si low <= value <= high ; sinon out_low / out_high
 * - 'lt'    : seuil = high ("doit être < high"). optimal si value <= high ; sinon out_high
 * - 'gt'    : seuil = low ("doit être > low").  optimal si value >= low ; sinon out_low
 * - 'none'  : non évalué → 'unrated'
 */
export function getMarkerStatus(
  value: number | null | undefined,
  refLow: number | null | undefined,
  refHigh: number | null | undefined,
  operator?: RefOperator,
): MarkerStatus {
  if (value === null || value === undefined || Number.isNaN(value)) return 'unrated'
  const op = operator ?? inferOperator(refLow, refHigh)

  switch (op) {
    case 'range':
      if (refLow === null || refLow === undefined || refHigh === null || refHigh === undefined) return 'unrated'
      if (value < refLow) return 'out_low'
      if (value > refHigh) return 'out_high'
      return 'optimal'
    case 'lt':
      if (refHigh === null || refHigh === undefined) return 'unrated'
      return value <= refHigh ? 'optimal' : 'out_high'
    case 'gt':
      if (refLow === null || refLow === undefined) return 'unrated'
      return value >= refLow ? 'optimal' : 'out_low'
    default:
      return 'unrated'
  }
}

export function isOutOfRange(status: MarkerStatus): boolean {
  return status === 'out_low' || status === 'out_high'
}

// Mappe le statut vers l'enum autorisé par la colonne DB blood_markers.status.
export function toDbStatus(status: MarkerStatus): 'optimal' | 'low_normal' | 'high_normal' | null {
  switch (status) {
    case 'optimal': return 'optimal'
    case 'out_low': return 'low_normal'
    case 'out_high': return 'high_normal'
    default: return null
  }
}
