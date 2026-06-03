'use client'

import { useAccount } from '@/lib/context/useAccount'

export default function RejectedGate({ children }: { children: React.ReactNode }) {
  const { isRejected } = useAccount()

  if (isRejected) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        textAlign: 'center',
      }}>
        <div style={{
          width: 48, height: 48,
          borderRadius: '50%',
          backgroundColor: 'var(--color-rust-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 24,
        }}>
          <span style={{ fontSize: 20 }}>×</span>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '-0.03em', marginBottom: 12 }}>
          Compte non validé
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-ink-3)', lineHeight: 1.6, maxWidth: 320 }}>
          Ton compte n'a pas pu être activé. Pour toute question, contacte-nous à{' '}
          <a href="mailto:contact@lyvio.eu" style={{ color: 'var(--color-ink-2)' }}>
            contact@lyvio.eu
          </a>.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
