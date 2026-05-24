'use client'

import { usePersonaContext } from '@/lib/context/PersonaContext'

export default function DemoModeBanner() {
  const { state, setReal } = usePersonaContext()

  if (state.mode !== 'demo') return null

  return (
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
        onClick={() => setReal()}
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
  )
}
