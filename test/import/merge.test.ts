/**
 * INVARIANT — dédup/merge : un (marqueur, date) déjà présent n'est JAMAIS
 * écrasé silencieusement ; une valeur divergente devient un conflit signalé.
 */
import { describe, it, expect } from 'vitest'
import { planMarkerMerge, markerCodeOf } from '@/lib/health/merge-panel'
import type { BloodMarkerData } from '@/lib/health/blood-panel-parser'

const mk = (code: string, name: string, value: number): BloodMarkerData => ({
  markerCode: code, markerName: name, value, unit: 'g/L', refMin: null, refMax: null, organSystem: 'glucides',
})

describe('Invariant — dédup : aucun écrasement silencieux', () => {
  it('marqueur déjà présent, même valeur → ni insert ni conflit', () => {
    const plan = planMarkerMerge(new Map([['glycemie', 0.95]]), [mk('glycemie', 'Glycémie', 0.95)])
    expect(plan.toInsert).toHaveLength(0)
    expect(plan.conflicts).toHaveLength(0)
  })

  it('marqueur absent → inséré', () => {
    const plan = planMarkerMerge(new Map([['glycemie', 0.95]]), [mk('creatinine', 'Créatinine', 9)])
    expect(plan.toInsert.map(markerCodeOf)).toEqual(['creatinine'])
    expect(plan.conflicts).toHaveLength(0)
  })

  it('marqueur présent, valeur DIFFÉRENTE → conflit, JAMAIS d\'insert (pas d\'écrasement)', () => {
    const plan = planMarkerMerge(new Map([['glycemie', 0.95]]), [mk('glycemie', 'Glycémie', 1.20)])
    expect(plan.toInsert).toHaveLength(0)
    expect(plan.conflicts).toEqual([{ marker: 'Glycémie', existing: 0.95, incoming: 1.20 }])
  })

  it('égalité tolérante (1.0 vs 1.00) → pas de faux conflit', () => {
    const plan = planMarkerMerge(new Map([['glycemie', 1.0]]), [mk('glycemie', 'Glycémie', 1.0)])
    expect(plan.conflicts).toHaveLength(0)
    expect(plan.toInsert).toHaveLength(0)
  })
})
