'use client'

export default function MobileGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile blocking screen — shown below 900px */}
      <div
        style={{
          display: 'none',
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: '#FAFAF8',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
          textAlign: 'center',
        }}
        className="mobile-gate"
      >
        {/* Logo */}
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: '-0.04em',
          color: 'var(--color-ink)',
          marginBottom: 40,
        }}>
          Lyvio
        </p>

        {/* Biotech accent dot */}
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: 'var(--color-lichen-soft)',
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: 'var(--color-lichen)',
          }} />
        </div>

        <h1 style={{
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '-0.03em',
          color: 'var(--color-ink)',
          marginBottom: 16,
          lineHeight: 1.2,
        }}>
          Lyvio s'utilise sur ordinateur
        </h1>

        <p style={{
          fontSize: 15,
          color: 'var(--color-ink-3)',
          lineHeight: 1.6,
          maxWidth: 300,
          marginBottom: 40,
        }}>
          L'expérience Lyvio est conçue pour grand écran. Rends-toi sur un ordinateur pour explorer ton tableau de bord. La version mobile arrive bientôt.
        </p>

        <a
          href="https://instagram.com/lyvio.eu"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 13,
            color: 'var(--color-ink-3)',
            textDecoration: 'none',
            borderBottom: '1px solid var(--color-ink-5)',
            paddingBottom: 2,
          }}
        >
          @lyvio.eu
        </a>
      </div>

      {/* Desktop app — hidden below 900px */}
      <div className="desktop-app">
        {children}
      </div>
    </>
  )
}
