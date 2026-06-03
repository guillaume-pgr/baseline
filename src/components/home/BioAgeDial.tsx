// SVG arc 270° — r=110, circumference≈691.15
// rotate(135) starts arc at bottom-left; dashoffset leaves 90° gap
const R = 110
const CX = 140
const C = 2 * Math.PI * R // 691.15

function arcDashOffset(bioAge: number, chronoAge: number): number {
  // Map bio age onto 270° arc: younger = more filled
  // Scale: assume range [chronoAge-10, chronoAge] → 0% to 100% of arc
  const maxDelta = 10
  const ratio = Math.min(Math.max((chronoAge - bioAge) / maxDelta, 0), 1)
  // 270° arc = 75% of circumference; gap = 25% of circumference
  const arcLen = C * 0.75
  const visible = arcLen * ratio
  return C - visible
}

type Props = {
  value: number
  chronoAge: number
  delta: number
}

export default function BioAgeDial({ value, chronoAge, delta }: Props) {
  const offset = arcDashOffset(value, chronoAge)
  const deltaStr = delta < 0 ? `${delta} ans` : `+${delta} ans`

  return (
    <div style={{ position: 'relative', width: 260, height: 260, flexShrink: 0 }}>
      <svg viewBox="0 0 280 280" style={{ width: '100%', height: '100%' }}>
        {/* Track — full circle, light */}
        <circle
          cx={CX} cy={CX} r={R}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={2}
        />
        {/* Progress arc */}
        <circle
          cx={CX} cy={CX} r={R}
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth={2}
          strokeDasharray={C}
          strokeDashoffset={offset}
          transform={`rotate(135 ${CX} ${CX})`}
          strokeLinecap="round"
        />
        {/* Tick marks */}
        <g stroke="rgba(0,0,0,0.12)" strokeWidth={1}>
          <line x1="140" y1="22" x2="140" y2="30" />
          <line x1="258" y1="140" x2="250" y2="140" />
          <line x1="22" y1="140" x2="30" y2="140" />
          <line x1="140" y1="258" x2="140" y2="250" />
        </g>
      </svg>

      {/* Center text */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-ink-4)',
          marginBottom: 6,
        }}>
          Âge biologique
        </p>
        <p style={{
          fontSize: '5.25rem',
          fontWeight: 200,
          lineHeight: 0.9,
          letterSpacing: '-0.05em',
          color: 'var(--color-ink)',
        }}>
          {value.toString().replace('.', ',')}
        </p>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.06em',
          color: 'var(--color-ink-3)',
          marginTop: 4,
        }}>
          vs {chronoAge.toFixed(1).replace('.', ',')} chrono
        </p>
        <div style={{
          marginTop: 12,
          padding: '4px 11px',
          backgroundColor: 'var(--color-lichen-soft)',
          color: 'var(--color-ink-2)',
          fontSize: 11,
          fontWeight: 600,
          borderRadius: 999,
          letterSpacing: '0.01em',
        }}>
          {deltaStr}
        </div>
      </div>
    </div>
  )
}
