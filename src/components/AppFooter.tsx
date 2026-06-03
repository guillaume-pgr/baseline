export default function AppFooter() {
  return (
    <footer style={{
      padding: '20px 56px',
      borderTop: '1px solid var(--color-line)',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 9, color: 'var(--color-ink-4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
        Outil éducatif. Ne remplace pas un avis médical.
      </span>
      <span style={{ color: 'var(--color-ink-5)', fontSize: 9 }}>·</span>
      <span style={{ fontSize: 9, color: 'var(--color-ink-4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
        Données hébergées en Europe (Francfort) · Conforme RGPD
      </span>
      <span style={{ color: 'var(--color-ink-5)', fontSize: 9 }}>·</span>
      <a
        href="mailto:contact@lyvio.eu"
        style={{ fontSize: 9, color: 'var(--color-ink-4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em', textDecoration: 'none' }}
      >
        contact@lyvio.eu
      </a>
      <span style={{ color: 'var(--color-ink-5)', fontSize: 9 }}>·</span>
      <a
        href="https://instagram.com/lyvio.eu"
        target="_blank"
        rel="noopener noreferrer"
        style={{ fontSize: 9, color: 'var(--color-ink-4)', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em', textDecoration: 'none' }}
      >
        @lyvio.eu
      </a>
    </footer>
  )
}
