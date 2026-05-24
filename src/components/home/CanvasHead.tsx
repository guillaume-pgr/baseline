import { IconCheck, IconUpload, IconPlus } from '@tabler/icons-react'
import type { PersonaData } from '@/lib/context/PersonaContext'

type Props = {
  syncSources: PersonaData['syncSources']
}

export default function CanvasHead({ syncSources }: Props) {
  const today = new Date()
  const eyebrow = today.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      alignItems: 'center',
      gap: 32,
      paddingBottom: 24,
      borderBottom: '1px solid var(--color-line)',
      marginBottom: 56,
    }}>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.16em',
        color: 'var(--color-ink-4)',
      }}>
        {eyebrow}
      </p>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Sync pills */}
        <div style={{ display: 'flex', gap: 6, marginRight: 12 }}>
          {syncSources.map((src) => (
            <span key={src.label} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 10px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-line)',
              borderRadius: 999,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--color-ink-3)',
              letterSpacing: '0.04em',
            }}>
              {src.status === 'live' ? (
                <span style={{
                  display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                  backgroundColor: 'var(--color-lichen)',
                  animation: 'pulse-dot 2s infinite',
                }} />
              ) : (
                <IconCheck size={11} color="var(--color-lichen)" />
              )}
              {src.label} · {src.detail}
            </span>
          ))}
        </div>

        {/* Actions */}
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontSize: 13, fontWeight: 500,
          padding: '9px 16px', borderRadius: 999,
          border: '1px solid var(--color-line-2)',
          backgroundColor: 'transparent',
          color: 'var(--color-ink-2)',
          cursor: 'pointer',
        }}>
          <IconUpload size={14} />
          Importer un bilan
        </button>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontSize: 13, fontWeight: 500,
          padding: '9px 16px', borderRadius: 999,
          border: '1px solid var(--color-ink)',
          backgroundColor: 'var(--color-ink)',
          color: 'var(--color-bg)',
          cursor: 'pointer',
        }}>
          <IconPlus size={14} />
          Mesure
        </button>
      </div>
    </div>
  )
}
