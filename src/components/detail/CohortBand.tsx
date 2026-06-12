type CohortBandProps = {
  percentile: number
  warn?: boolean
  label?: string
  context?: React.ReactNode
}

export default function CohortBand({ percentile, warn, label, context }: CohortBandProps) {
  return (
    <div>
      {label && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 14 }}>
          {label}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_2fr] md:gap-8" style={{ alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 6 }}>
            {percentile}<sup style={{ fontSize: 22, verticalAlign: 'super', marginLeft: 2 }}>ᵉ</sup>
          </div>
          {context && (
            <p style={{ fontSize: 12, color: 'var(--color-ink-3)' }}>{context}</p>
          )}
        </div>

        <div>
          {/* Gradient band */}
          <div style={{ position: 'relative', height: 38, marginBottom: 6 }}>
            <div style={{
              position: 'absolute', top: '50%', left: 0, right: 0,
              transform: 'translateY(-50%)', height: 5, borderRadius: 999,
              background: `linear-gradient(to right,
                var(--color-rust-soft) 0%, var(--color-rust-soft) 15%,
                var(--color-amber-soft) 15%, var(--color-amber-soft) 35%,
                var(--color-lichen-soft) 35%, var(--color-lichen-soft) 65%,
                var(--color-amber-soft) 65%, var(--color-amber-soft) 85%,
                var(--color-rust-soft) 85%, var(--color-rust-soft) 100%)`,
            }} />
            {/* Median tick */}
            <div style={{
              position: 'absolute', top: 12, left: '50%',
              width: 1, height: 14, backgroundColor: 'var(--color-ink-4)',
            }}>
              <span style={{
                position: 'absolute', top: -14, left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--color-ink-4)',
                whiteSpace: 'nowrap',
              }}>médiane</span>
            </div>
            {/* Cursor */}
            <div style={{
              position: 'absolute', top: '50%', left: `${percentile}%`,
              transform: 'translate(-50%, -50%)',
              width: 14, height: 14,
              backgroundColor: warn ? 'var(--color-rust)' : 'var(--color-ink)',
              border: '3px solid var(--color-surface)',
              borderRadius: '50%',
              zIndex: 2,
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }} />
          </div>
          {/* Scale labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', letterSpacing: '0.04em' }}>
            {['p10', 'p25', 'p50', 'p75', 'p90'].map(l => <span key={l}>{l}</span>)}
          </div>
        </div>
      </div>
    </div>
  )
}
