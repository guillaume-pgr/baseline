// Multi-series evolution chart — thin lines, small dots, optional area under first series.
// Same visual register as EvolutionLineChart (aerobic/sleep style).

type Series = {
  label: string
  values: number[]
  color: string  // hex or CSS var
}

type EvolutionMultiLineChartProps = {
  title: string
  series: Series[]
  dates: string[]
  id: string          // unique ID for gradient
  showValues?: boolean
}

function normalize(values: number[], allValues: number[], H: number): number[] {
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const range = max - min || 1
  return values.map(v => H - ((v - min) / range) * H * 0.8 + H * 0.1)
}

const W = 700, CHART_H = 120, TOTAL_H = 168

export default function EvolutionMultiLineChart({
  title, series, dates, id, showValues = false,
}: EvolutionMultiLineChartProps) {
  const n = dates.length
  const step = (W - 80) / (n - 1)
  const xs = dates.map((_, i) => 40 + i * step)
  const gradId = `evol-multi-${id}`

  // Normalize all series on a shared scale for proper comparison
  const allValues = series.flatMap(s => s.values)
  const ysByS = series.map(s => normalize(s.values, allValues, CHART_H))

  const primaryPts = xs.map((x, i) => `${x},${ysByS[0][i]}`).join(' ')
  const areaBottom = CHART_H + 24
  const primaryArea = `${xs[0]},${areaBottom} ${primaryPts} ${xs[n - 1]},${areaBottom}`
  const primaryColor = series[0]?.color ?? 'var(--color-ink)'

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.015em' }}>{title}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)', letterSpacing: '0.06em' }}>
          {dates[0]} → {dates[n - 1]}
        </span>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        {series.map(s => (
          <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.05em', color: 'var(--color-ink-3)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
            {s.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${TOTAL_H}`} style={{ width: '100%' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity={0.1} />
            <stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Subtle grid */}
        <g stroke="rgba(0,0,0,0.05)" strokeWidth={1}>
          <line x1={40} y1={24 + CHART_H * 0.25} x2={W - 40} y2={24 + CHART_H * 0.25} />
          <line x1={40} y1={24 + CHART_H * 0.75} x2={W - 40} y2={24 + CHART_H * 0.75} />
        </g>
        {/* Area under primary series */}
        <polygon points={primaryArea} fill={`url(#${gradId})`} />
        {/* Lines + dots per series */}
        {series.map((s, si) => {
          const ys = ysByS[si]
          const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
          return (
            <g key={s.label}>
              <polyline fill="none" stroke={s.color} strokeWidth={1.5}
                strokeLinecap="round" strokeLinejoin="round" points={pts} />
              {xs.map((x, i) => (
                <g key={i}>
                  <circle cx={x} cy={ys[i]} r={i === n - 1 ? 4 : 3}
                    fill={s.color}
                    stroke={i === n - 1 ? 'white' : s.color}
                    strokeWidth={i === n - 1 ? 1.5 : 0}
                  />
                  {showValues && si === 0 && (
                    <text x={x} y={ys[i] - 9} textAnchor="middle"
                      fontFamily="var(--font-mono)" fontSize={9} fill="var(--color-ink-3)">
                      {s.values[i]}
                    </text>
                  )}
                </g>
              ))}
            </g>
          )
        })}
        {/* X labels */}
        <g fontFamily="var(--font-mono)" fontSize={9} fill="#A8A8A8">
          {dates.map((d, i) => (
            <text key={i} x={xs[i]} y={TOTAL_H - 4} textAnchor="middle">{d}</text>
          ))}
        </g>
      </svg>
    </div>
  )
}
