/**
 * INVARIANTS de la route d'écriture (POST /api/health/import) — hors-ligne :
 *  - écriture sous l'id renvoyé par le gating (= auth.uid),
 *  - réponse exposant les bilans (revalidation lisible),
 *  - dédup : un marqueur déjà présent à cette date n'est pas réinséré.
 * Supabase + gating mockés ; AUCUN réseau, AUCUNE vraie base.
 */
import { describe, it, expect, vi } from 'vitest'
import { makeSupabaseMock, type QueryCtx } from '../helpers/supabase-mock'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/health/gating', () => ({ checkBloodPanelGate: vi.fn() }))

import { POST } from '@/app/api/health/import/route'
import { createClient } from '@/lib/supabase/server'
import { checkBloodPanelGate } from '@/lib/health/gating'

const PROFILE_FOR_AUTH_UID = 'profile-of-auth-uid'

function setup(onQuery: (ctx: QueryCtx) => { data: unknown; error: unknown }) {
  const mock = makeSupabaseMock({ user: { id: 'AUTH_UID', email: 'a@b.c' }, onQuery })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(createClient as any).mockResolvedValue(mock.client)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(checkBloodPanelGate as any).mockResolvedValue({ ok: true, profileId: PROFILE_FOR_AUTH_UID })
  return mock
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const reqWith = (body: unknown) => ({ json: async () => body }) as any

const onePanelBody = {
  labName: 'Laboratoire Synthétique',
  panels: [{
    panelDate: '2026-03-02',
    markers: [{ markerCode: 'glycemie', markerName: 'Glycémie à jeun', value: 0.95, unit: 'g/L', refMin: 0.7, refMax: 1.1, organSystem: 'glucides' }],
  }],
}

describe('Invariant — écriture sous auth.uid() (profil du gating)', () => {
  it('insère le bilan avec profile_id = id renvoyé par le gating', async () => {
    const mock = setup(ctx => {
      if (ctx.table === 'blood_panels' && ctx.op === 'select') return { data: [], error: null }
      if (ctx.table === 'blood_panels' && ctx.op === 'insert') return { data: { id: 'PANEL_1' }, error: null }
      return { data: [], error: null }
    })
    const res = await POST(reqWith(onePanelBody))
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.panelsCreated).toBe(1)
    const panelInsert = mock.inserts.find(i => i.table === 'blood_panels')!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((panelInsert.rows as any).profile_id).toBe(PROFILE_FOR_AUTH_UID)
    expect(mock.inserts.some(i => i.table === 'blood_markers')).toBe(true)
  })
})

describe('Invariant — la réponse expose les bilans (donnée redevient lisible)', () => {
  it('réponse: success + compteurs + conflicts[]', async () => {
    setup(ctx => {
      if (ctx.table === 'blood_panels' && ctx.op === 'select') return { data: [], error: null }
      if (ctx.table === 'blood_panels' && ctx.op === 'insert') return { data: { id: 'PANEL_1' }, error: null }
      return { data: [], error: null }
    })
    const res = await POST(reqWith(onePanelBody))
    const body = await res.json()
    expect(body).toMatchObject({ success: true, panelsCreated: 1, panelsMerged: 0, markersCount: 1 })
    expect(Array.isArray(body.conflicts)).toBe(true)
  })
})

describe('Invariant — dédup à l\'écriture (pas d\'écrasement)', () => {
  it('bilan existant + même marqueur/valeur → aucun insert de marqueur, panelsMerged=1', async () => {
    const mock = setup(ctx => {
      if (ctx.table === 'blood_panels' && ctx.op === 'select') return { data: [{ id: 'PANEL_EXIST' }], error: null }
      if (ctx.table === 'blood_markers' && ctx.op === 'select') return { data: [{ marker_code: 'glycemie', value: 0.95 }], error: null }
      return { data: [], error: null }
    })
    const res = await POST(reqWith(onePanelBody))
    const body = await res.json()
    expect(body.panelsCreated).toBe(0)
    expect(body.panelsMerged).toBe(1)
    expect(mock.inserts.some(i => i.table === 'blood_markers')).toBe(false)
  })
})
