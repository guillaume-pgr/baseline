/**
 * INVARIANTS du chemin critique — extraction → réconciliation → bilans datés.
 * Rejoue des réponses Vision SYNTHÉTIQUES (fixtures JSON), 100% hors-ligne.
 * Si un test devient rouge, c'est une RÉGRESSION (cf. CLAUDE.md), pas un test
 * à assouplir.
 */
import { describe, it, expect } from 'vitest'
import { reconcileExtraction, type RawExtraction } from '@/lib/health/reconcile'
import { groupIntoDatedPanels } from '@/lib/health/group-panels'

import monoJson from '../fixtures/import/vision-responses/mono-date.json'
import multiJson from '../fixtures/import/vision-responses/multi-date-cofrac.json'
import edgeJson from '../fixtures/import/vision-responses/edge-biunit-partial.json'

const mono = monoJson as unknown as RawExtraction
const multi = multiJson as unknown as RawExtraction
const edge = edgeJson as unknown as RawExtraction

const ISO = /^\d{4}-\d{2}-\d{2}$/

// Réconcilie + regroupe (pdfText vide → pas de recoupement texte, déterministe).
function run(raw: RawExtraction) {
  const panel = reconcileExtraction(raw)
  const grouped = groupIntoDatedPanels(panel.markers, panel.panelDate, '')
  return { panel, ...grouped }
}

const byName = (markers: { markerName: string }[], name: string) =>
  markers.find(m => m.markerName === name)

describe('Invariant — un PDF valide ne produit JAMAIS 0 bilan ni 0 marqueur', () => {
  for (const [label, raw] of [['mono', mono], ['multi', multi], ['edge', edge]] as const) {
    it(`${label} : ≥ 1 bilan et ≥ 1 marqueur`, () => {
      const { panels } = run(raw)
      expect(panels.length).toBeGreaterThanOrEqual(1)
      const totalMarkers = panels.reduce((s, p) => s + p.markers.length, 0)
      expect(totalMarkers).toBeGreaterThan(0)
      expect(panels[0].markers.length).toBeGreaterThan(0)
    })
  }
})

describe('Invariant — chemin mono-date = TOUJOURS exactement 1 bilan', () => {
  it('mono-date.json → 1 bilan, daté du prélèvement', () => {
    const { panels } = run(mono)
    expect(panels).toHaveLength(1)
    expect(panels[0].isPrimary).toBe(true)
    expect(panels[0].date).toBe('2026-03-02')
  })

  it('edge (antériorité partielle) reste multi-dates mais cohérent', () => {
    const { panels } = run(edge)
    // 2026-03-02 (2 marqueurs) + 2025-04-25 (cholestérol seul, partiel)
    expect(panels).toHaveLength(2)
    expect(panels[0].markers).toHaveLength(2)
    const prior = panels.find(p => p.date === '2025-04-25')!
    expect(prior.markers).toHaveLength(1)
    expect(prior.markers[0].markerName).toBe('Cholestérol total')
  })
})

describe('Invariant — multi-dates produit ≥ 2 bilans datés DISTINCTS', () => {
  it('multi-date-cofrac.json → 3 bilans distincts (jour + 2 antériorités)', () => {
    const { panels } = run(multi)
    expect(panels.length).toBeGreaterThanOrEqual(2)
    const dates = panels.map(p => p.date)
    expect(new Set(dates).size).toBe(dates.length) // toutes distinctes
    expect(dates).toEqual(['2026-03-02', '2025-04-25', '2024-08-23'])
  })

  it('cadence propre : HbA1c seule au 2024-08-23 (bilan partiel)', () => {
    const { panels } = run(multi)
    const hba1cPanel = panels.find(p => p.date === '2024-08-23')!
    expect(hba1cPanel.markers).toHaveLength(1)
    expect(hba1cPanel.markers[0].markerName).toBe('Hémoglobine glyquée')
    // l'autre antériorité regroupe les 4 marqueurs au 2025-04-25
    expect(panels.find(p => p.date === '2025-04-25')!.markers.length).toBe(4)
  })
})

describe('Invariant — antériorité : unité héritée de la ligne du jour, bornes du référentiel', () => {
  it('même unité que le jour + bornes issues du reference file', () => {
    const { panels } = run(multi)
    const dayGly = byName(panels[0].markers, 'Glycémie à jeun')!
    const priorGly = byName(panels.find(p => p.date === '2025-04-25')!.markers, 'Glycémie à jeun')!
    expect(priorGly.unit).toBe(dayGly.unit) // unité héritée
    // ref_low/high omis dans la fixture → bornes du référentiel (0.70–1.10)
    expect(priorGly.refMin).toBe(0.70)
    expect(priorGly.refMax).toBe(1.10)
    expect(priorGly.refMin).toBe(dayGly.refMin)
    expect(priorGly.refMax).toBe(dayGly.refMax)
  })
})

describe('Invariant — bi-unités = UN seul marqueur (jamais deux)', () => {
  it('cholestérol g/L + mmol/L → 1 marqueur avec valeur secondaire', () => {
    const { panel } = run(edge)
    const chol = panel.markers.filter(m => m.markerName === 'Cholestérol total')
    expect(chol).toHaveLength(1)
    expect(chol[0].value).toBe(1.80)
    expect(chol[0].secondaryValue).toBe(4.65)
  })
})

describe('Invariant — lignes témoin/contrôle/technique exclues', () => {
  it('mono : témoin + turbidité jamais dans la sortie', () => {
    const { panel } = run(mono)
    const names = panel.markers.map(m => m.markerName.toLowerCase())
    expect(names.some(n => n.includes('témoin') || n.includes('temoin'))).toBe(false)
    expect(names.some(n => n.includes('turbidité') || n.includes('turbidite'))).toBe(false)
    expect(panel.markers).toHaveLength(4) // 6 lignes - 2 exclues
  })
})

describe('Invariant — dates et intervalles ne sont JAMAIS des marqueurs/valeurs', () => {
  it('aucun nom de marqueur n\'est une date ou un intervalle (x–y) ; valeurs finies ; dates ISO', () => {
    for (const raw of [mono, multi, edge]) {
      const { panels } = run(raw)
      for (const p of panels) {
        expect(p.date).toMatch(ISO)
        for (const m of p.markers) {
          expect(m.markerName).not.toMatch(ISO)
          expect(m.markerName).not.toMatch(/^\(?\s*-?\d+([.,]\d+)?\s*[–\-]\s*\d/) // "(3.8-11)" etc.
          expect(Number.isFinite(m.value)).toBe(true)
        }
      }
    }
  })
})

describe('Invariant — confiance globale bornée [0,1]', () => {
  it('globalConfidence ∈ [0,1] sur chaque fixture', () => {
    for (const raw of [mono, multi, edge]) {
      const { globalConfidence } = run(raw)
      expect(globalConfidence).toBeGreaterThanOrEqual(0)
      expect(globalConfidence).toBeLessThanOrEqual(1)
    }
  })
})
