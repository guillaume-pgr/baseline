/**
 * INVARIANT — l'écriture est rattachée à auth.uid() : le gating lit le profil
 * PAR user_id (= auth.uid) et renvoie son id, utilisé ensuite pour l'insertion.
 * Cohérence garantie avec la lecture (useRealBloodPanels filtre le même profil).
 */
import { describe, it, expect } from 'vitest'
import { checkBloodPanelGate } from '@/lib/health/gating'
import { makeSupabaseMock } from '../helpers/supabase-mock'

describe('Invariant — gating ancré sur auth.uid()', () => {
  it('approved_premium : ok, profileId renvoyé, filtre user_id = auth.uid', async () => {
    const { client, queries } = makeSupabaseMock({
      user: { id: 'AUTH_UID' },
      onQuery: ctx =>
        ctx.table === 'profiles'
          ? { data: [{ id: 'PROFILE_X', status: 'approved_premium', is_admin: false }], error: null }
          : { data: [], error: null },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await checkBloodPanelGate(client as any, { id: 'AUTH_UID', email: 'a@b.c' } as any)
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.profileId).toBe('PROFILE_X')
    const profileQuery = queries.find(q => q.table === 'profiles')
    expect(profileQuery?.filters.user_id).toBe('AUTH_UID')
  })

  it('pending : refusé → pas d\'écriture autorisée', async () => {
    const { client } = makeSupabaseMock({
      user: { id: 'U' },
      onQuery: ctx =>
        ctx.table === 'profiles'
          ? { data: [{ id: 'P', status: 'pending', is_admin: false }], error: null }
          : { data: [], error: null },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await checkBloodPanelGate(client as any, { id: 'U', email: 'u@u.u' } as any)
    expect(res.ok).toBe(false)
  })
})
