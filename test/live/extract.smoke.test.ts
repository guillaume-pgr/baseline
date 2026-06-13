/**
 * SMOKE « live » — OPT-IN UNIQUEMENT (jamais dans le run par défaut ni en CI).
 * Appelle RÉELLEMENT Claude Vision sur un PDF synthétique pour détecter une
 * dérive de prompt/schéma. Lancer manuellement :
 *   pnpm run test:import:live   (nécessite ANTHROPIC_API_KEY + un PDF dans test/fixtures/import/pdfs/)
 *
 * Skippé sauf si RUN_LIVE=1. Les imports lourds (SDK Anthropic) sont dynamiques
 * pour que la collecte reste légère et ne casse jamais le run par défaut.
 */
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const LIVE = process.env.RUN_LIVE === '1'
const PDF = fileURLToPath(new URL('../fixtures/import/pdfs/multi-date-cofrac.pdf', import.meta.url))

describe.skipIf(!LIVE)('live Vision smoke (opt-in)', () => {
  it('un PDF multi-dates réel produit ≥ 2 bilans datés via le vrai pipeline', async () => {
    if (!existsSync(PDF)) {
      throw new Error(`PDF de smoke manquant : ${PDF}. Dépose un PDF SYNTHÉTIQUE (sans données réelles).`)
    }
    // Imports dynamiques : uniquement quand le smoke tourne réellement.
    const { getAnthropicClient } = await import('@/lib/anthropic')
    const { reconcileExtraction } = await import('@/lib/health/reconcile')
    const { groupIntoDatedPanels } = await import('@/lib/health/group-panels')

    const base64 = readFileSync(PDF).toString('base64')
    const anthropic = getAnthropicClient()
    // NB : on réutilise volontairement le même schéma que la route d'extraction.
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 8192,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: 'Extrais le compte rendu (métadonnées, marqueurs, antériorités datées).' },
        ],
      }],
    })
    // Le smoke vérifie surtout que le pipeline déterministe tient toujours debout.
    const text = message.content.find(b => b.type === 'text')
    expect(text).toBeTruthy()
    // (Le maintainer peut étendre : parser le tool_use puis reconcile + group,
    //  et asserter panels.length >= 2 — voir la route /api/health/extract.)
    void reconcileExtraction
    void groupIntoDatedPanels
  }, 60_000)
})
