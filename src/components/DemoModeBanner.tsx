'use client'

import { useState } from 'react'
import { usePersonaContext } from '@/lib/context/PersonaContext'
import ComingSoonModal from '@/components/ComingSoonModal'

export default function DemoModeBanner() {
  const { state } = usePersonaContext()
  const [comingSoonOpen, setComingSoonOpen] = useState(false)

  if (state.mode !== 'demo') return null

  return (
    <>
      <ComingSoonModal open={comingSoonOpen} onClose={() => setComingSoonOpen(false)} />
      <div style={{
        backgroundColor: 'var(--color-amber-soft)',
        borderBottom: '1px solid var(--color-amber)',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <span style={{
          fontFamily: 'Manrope, sans-serif',
          fontSize: 13,
          color: 'var(--color-ink)',
        }}>
          Mode projection — données fictives pour démonstration
        </span>
        <button
          onClick={() => setComingSoonOpen(true)}
          style={{
            fontFamily: 'Manrope, sans-serif',
            fontSize: 12,
            fontWeight: 500,
            padding: '6px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            color: 'var(--color-ink)',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.12)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.08)'
          }}
        >
          Passer en mode réel
        </button>
      </div>
    </>
  )
}
