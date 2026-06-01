'use client'

interface ComingSoonModalProps {
  open: boolean
  onClose: () => void
}

export default function ComingSoonModal({ open, onClose }: ComingSoonModalProps) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 32,
          maxWidth: 380,
          width: '90%',
        }}
        onClick={e => e.stopPropagation()}
      >
        <h2 style={{ fontFamily: 'Manrope, sans-serif', fontSize: 24, fontWeight: 300, margin: 0, marginBottom: 16 }}>
          Bientôt disponible
        </h2>

        <p style={{ fontSize: 13, color: 'var(--color-ink-3)', margin: 0, marginBottom: 24, lineHeight: 1.6 }}>
          Le suivi de tes données réelles arrive très prochainement. En attendant, explore Lyvio en mode démo.
        </p>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px 16px',
            backgroundColor: 'black',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-ink)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.backgroundColor = 'black'
          }}
        >
          Compris
        </button>
      </div>
    </div>
  )
}
