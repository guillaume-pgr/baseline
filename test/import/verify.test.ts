/**
 * INVARIANT — l'auto-vérification route les antériorités à faible confiance
 * vers la revue manuelle (seuil relevé), sans changer le comportement du jour.
 */
import { describe, it, expect } from 'vitest'
import { verifyMarkers } from '@/lib/health/verify'
import type { ReconciledMarker } from '@/lib/health/reconcile'

function rm(over: Partial<ReconciledMarker>): ReconciledMarker {
  return {
    markerCode: '', markerName: 'Marqueur inconnu test', rawName: 'Marqueur inconnu test',
    value: 1, rawValue: 1, unit: 'g/L', refMin: 0, refMax: 2, refOperator: 'range',
    organSystem: null, explanation: null, secondaryValue: null, secondaryUnit: null,
    confidence: 0.7, converted: false, needsReview: false, priorValues: [], ...over,
  }
}

describe('Invariant — antériorité plus prudente que la colonne du jour', () => {
  it('confiance 0.7 : OK le jour (seuil 0.6), à vérifier en antériorité (seuil 0.75)', () => {
    const day = verifyMarkers([rm({ confidence: 0.7 })], '')
    expect(day.markers[0].extractionFlag).toBe(false)

    const prior = verifyMarkers([rm({ confidence: 0.7 })], '', { priorColumn: true })
    expect(prior.markers[0].extractionFlag).toBe(true)
  })

  it('hors-norme n\'est jamais "à vérifier" (extraction vs résultat)', () => {
    // valeur 5 hors [0,2] → outOfRange, mais extraction fiable (conf 0.95) → pas de flag
    const r = verifyMarkers([rm({ value: 5, confidence: 0.95 })], '')
    expect(r.markers[0].outOfRange).toBe(true)
    expect(r.markers[0].extractionFlag).toBe(false)
  })
})
