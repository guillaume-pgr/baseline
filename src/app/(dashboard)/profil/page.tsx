'use client'

import { useSession } from '@/lib/context/SessionContext'
import { useAccount } from '@/lib/context/useAccount'

const STATUS_LABEL: Record<string, string> = {
  pending: 'En attente d\'activation',
  approved_free: 'Compte gratuit',
  approved_premium: 'Lyvio+',
  rejected: 'Non activé',
}

export default function ProfilPage() {
  const { user, signOut } = useSession()
  const { status, isAdmin } = useAccount()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('[profil] signOut error:', err)
    }
    window.location.href = '/auth/signin'
  }

  return (
    <div style={{ padding: '32px 24px 96px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 300, letterSpacing: '-0.03em', color: 'var(--color-ink)', marginBottom: 24 }}>
        Profil
      </h1>

      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-ink-4)', margin: '0 0 6px' }}>
          Email
        </p>
        <p style={{ fontSize: 14, color: 'var(--color-ink)', margin: '0 0 16px', wordBreak: 'break-all' }}>
          {user?.email ?? '—'}
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-ink-4)', margin: '0 0 6px' }}>
          Statut
        </p>
        <p style={{ fontSize: 14, color: 'var(--color-ink)', margin: 0 }}>
          {isAdmin ? 'Administrateur' : (STATUS_LABEL[status] ?? status)}
        </p>
      </div>

      <button
        onClick={handleSignOut}
        style={{
          width: '100%', padding: '12px 16px', borderRadius: 10,
          border: '1px solid var(--color-line-2)', backgroundColor: 'var(--color-surface)',
          color: 'var(--color-ink)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
        }}
      >
        Déconnexion
      </button>

      <p style={{ fontSize: 12, color: 'var(--color-ink-4)', lineHeight: 1.6, marginTop: 20 }}>
        Outil éducatif. Ne remplace pas un avis médical.
      </p>
    </div>
  )
}
