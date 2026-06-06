import type { SupabaseClient, User } from '@supabase/supabase-js'
import { ADMIN_EMAIL } from '@/lib/config'

/**
 * Blood-panel gating:
 *   free  → 1 prise de sang max
 *   premium / admin → illimité (admin bypass)
 *   pending / rejected → aucun import
 *
 * Returns the caller's profile id when allowed, or an error + HTTP status when not.
 * Enforced server-side in both the extract and import routes.
 */
export async function checkBloodPanelGate(
  supabase: SupabaseClient,
  user: User,
): Promise<
  | { ok: true; profileId: string }
  | { ok: false; status: number; error: string }
> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, status, is_admin')
    .eq('user_id', user.id)
    .single() as { data: { id: string; status: string; is_admin: boolean } | null }

  if (!profile) {
    return { ok: false, status: 404, error: 'Profil non trouvé' }
  }

  const isAdmin = profile.is_admin || user.email === ADMIN_EMAIL
  const isPremium = profile.status === 'approved_premium'
  const isFree = profile.status === 'approved_free'

  // Admin & premium: unlimited
  if (isAdmin || isPremium) {
    return { ok: true, profileId: profile.id }
  }

  // Free: 1 panel max
  if (isFree) {
    const { count } = await supabase
      .from('blood_panels')
      .select('id', { count: 'exact', head: true })
      .eq('profile_id', profile.id)

    if ((count ?? 0) >= 1) {
      return {
        ok: false,
        status: 403,
        error: 'Le plan gratuit est limité à 1 prise de sang. Passe à Lyvio+ pour en importer plus.',
      }
    }
    return { ok: true, profileId: profile.id }
  }

  // pending / rejected
  return {
    ok: false,
    status: 403,
    error: 'Ton compte n\'est pas encore autorisé à importer des données.',
  }
}
