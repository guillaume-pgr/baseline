// Compact SVG polyline chart — used for per-category evolution
const X_POS = [60, 185, 345, 510, 660]  // 5 bilans in 700-wide viewBox
const DATES = ['Oct 24', 'Mar 25', 'Sep 25', 'Jan 26', 'Mar 26']
const H = 150  // usable chart height

function normalize(values: number[], height: number): number[] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  // 10% padding top/bottom
  return values.map(v => height - ((v - min) / range) * height * 0.8 + height * 0.1)
}

type Series = {
  values: [number, number, number, number, number]
  color: string
  label: string
}

type MiniLineChartProps = {
  title: string
  series: Series[]
  dates?: string[]
  height?: number
}

export default function MiniLineChart({ title, series, dates = DATES, height = H }: MiniLineChartProps) {
  const vh = height

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.015em' }}>{title}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)', letterSpacing: '0.06em' }}>
          {dates[0]} → {dates[dates.length - 1]}
        </span>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 18, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)', marginBottom: 12, letterSpacing: '0.04em' }}>
        {series.map(s => (
          <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      {/* SVG chart */}
      <svg viewBox={`0 0 700 ${vh + 24}`} style={{ width: '100%' }}>
        {/* Grid lines */}
        <g stroke="rgba(0,0,0,0.05)" strokeWidth={1}>
          {[0.25, 0.5, 0.75].map(f => (
            <line key={f} x1={0} y1={vh * f} x2={700} y2={vh * f} />
          ))}
        </g>

        {/* Each series */}
        {series.map(s => {
          const ys = normalize(s.values, vh)
          const pts = X_POS.map((x, i) => `${x},${ys[i]}`).join(' ')
          return (
            <g key={s.label}>
              <polyline fill="none" stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" points={pts} />
              {X_POS.map((x, i) => (
                <circle key={i} cx={x} cy={ys[i]} r={i === 4 ? 5 : 3.5}
                  fill={s.color}
                  stroke={i === 4 ? 'white' : s.color}
                  strokeWidth={i === 4 ? 2 : 0}
                />
              ))}
            </g>
          )
        })}

        {/* X labels */}
        <g fontFamily="var(--font-mono)" fontSize={9} fill="#A8A8A8" letterSpacing={0.04 * 9}>
          {dates.map((d, i) => (
            <text key={i} x={X_POS[i]} y={vh + 18} textAnchor="middle">{d}</text>
          ))}
        </g>
      </svg>
    </div>
  )
}
