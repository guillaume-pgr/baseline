/**
 * INVARIANT STRICT — pas de fan-out d'une valeur d'antériorité sur plusieurs dates.
 * Une date d'en-tête propre à une section (ex. 2024-08-23 pour l'HbA1c) ne doit
 * JAMAIS produire une mesure pour un marqueur d'une autre section (ex. cholestérol).
 * Un marqueur produit exactement autant de mesures qu'il a de colonnes de valeur.
 *
 * Ce test est ROUGE sur le code qui fan-out, VERT après le guard déterministe.
 */
import { describe, it, expect } from 'vitest'
import { reconcileExtraction, type RawExtraction } from '@/lib/health/reconcile'
import { groupIntoDatedPanels } from '@/lib/health/group-panels'

import fanoutJson from '../fixtures/import/vision-responses/fanout-section-date.json'

const fanout = fanoutJson as unknown as RawExtraction

function run(raw: RawExtraction) {
  const panel = reconcileExtraction(raw)
  return groupIntoDatedPanels(panel.markers, panel.panelDate, '')
}

// Combien de bilans (mesures) contiennent ce marqueur ?
function panelsWith(panels: { markers: { markerName: string }[] }[], name: string) {
  return panels.filter(p => p.markers.some(m => m.markerName === name))
}

describe('Invariant — aucune valeur d\'antériorité dupliquée sur 2 dates', () => {
  it('cholestérol = 2 mesures (2026-03-02 + 2025-04-25), pas 3', () => {
    const { panels } = run(fanout)
    const cholPanels = panelsWith(panels, 'Cholestérol total')
    expect(cholPanels.map(p => p.date).sort()).toEqual(['2025-04-25', '2026-03-02'])
    expect(cholPanels).toHaveLength(2)
  })

  it('la date propre à l\'HbA1c (2024-08-23) ne contient QUE l\'HbA1c', () => {
    const { panels } = run(fanout)
    const aug = panels.find(p => p.date === '2024-08-23')!
    expect(aug.markers.map(m => m.markerName)).toEqual(['Hémoglobine glyquée'])
  })

  it('HbA1c conserve bien son point 2024-08-23 (multi-dates légitime préservé)', () => {
    const { panels } = run(fanout)
    expect(panelsWith(panels, 'Hémoglobine glyquée').map(p => p.date).sort())
      .toEqual(['2024-08-23', '2026-03-02'])
  })

  it('AUCUN marqueur n\'a la même valeur sur deux dates distinctes (anti fan-out)', () => {
    const { panels } = run(fanout)
    const valuesByMarker = new Map<string, { date: string; value: number }[]>()
    for (const p of panels) {
      for (const m of p.markers) {
        if (!valuesByMarker.has(m.markerName)) valuesByMarker.set(m.markerName, [])
        valuesByMarker.get(m.markerName)!.push({ date: p.date, value: m.value })
      }
    }
    for (const [, entries] of valuesByMarker) {
      const values = entries.map(e => e.value)
      expect(new Set(values).size).toBe(values.length) // aucune valeur répétée
    }
  })
})
