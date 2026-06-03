'use client'

import { useState } from 'react'
import { IconLock } from '@tabler/icons-react'
import ComingSoonModal from './ComingSoonModal'

type Props = {
  feature: string
  onViewDemo: () => void
}

export default function LockedPageOverlay({ feature, onViewDemo }: Props) {
  const [premiumOpen, setPremiumOpen] = useState(false)

  return (
    <>
      <ComingSoonModal open={premiumOpen} onClose={() => setPremiumOpen(false)} />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 40px',
        textAlign: 'center',
      }}>
        {/* Lock icon */}
        <div style={{
          width: 56, height: 56,
          borderRadius: '50%',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
        }}>
          <IconLock size={22} color="var(--color-ink-3)" strokeWidth={1.5} />
        </div>

        <h2 style={{
          fontSize: '1.75rem', fontWeight: 300,
          letterSpacing: '-0.03em',
          color: 'var(--color-ink)',
          marginBottom: 12,
        }}>
          {feature}
        </h2>

        <p style={{
          fontSize: 14,
          color: 'var(--color-ink-3)',
          lineHeight: 1.6,
          maxWidth: 360,
          marginBottom: 36,
        }}>
          Disponible avec Lyvio+. Passe au niveau supérieur pour accéder
          à l'ensemble de tes données de bien-être.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => setPremiumOpen(true)}
            style={{
              padding: '10px 22px',
              backgroundColor: 'var(--color-ink)',
              color: 'var(--color-bg)',
              border: 'none',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Passer à Lyvio+
          </button>
          <button
            onClick={onViewDemo}
            style={{
              padding: '10px 22px',
              backgroundColor: 'transparent',
              color: 'var(--color-ink-2)',
              border: '1px solid var(--color-line-2)',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Voir en démo
          </button>
        </div>
      </div>
    </>
  )
}
