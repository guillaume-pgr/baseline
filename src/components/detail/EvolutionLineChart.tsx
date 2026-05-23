// Single-series evolution chart — area gradient + dots + value labels
// Style matches aerobic VO₂ and sleep HRV charts.

type ColorKey = 'aqua' | 'lichen' | 'amber' | 'rust' | 'lavender'

const PALETTE: Record<ColorKey, string> = {
  aqua:     'var(--color-aqua)',
  lichen:   'var(--color-lichen)',
  amber:    'var(--color-amber)',
  rust:     'var(--color-rust)',
  lavender: 'var(--color-lavender)',
}

type DataPoint = { label: string; value: number }

type EvolutionLineChartProps = {
  title: string
  data: DataPoint[]
  color: ColorKey
  id: string         // unique ID → unique gradient ID per page
  showArea?: boolean
  showValues?: boolean
  unit?: string
}

function normalize(values: number[], H: number): number[] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return values.map(v => H - ((v - min) / range) * H * 0.8 + H * 0.1)
}

const W = 700, CHART_H = 120, TOTAL_H = 168

export default function EvolutionLineChart({
  title, data, color, id, showArea = true, showValues = true, unit,
}: EvolutionLineChartProps) {
  const stroke = PALETTE[color]
  const gradId = `evol-line-${id}`
  const n = data.length
  const step = (W - 80) / (n - 1)
  const xs = data.map((_, i) => 40 + i * step)
  const ys = normalize(data.map(d => d.value), CHART_H)
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
  const areaBottom = CHART_H + 24
  const area = `${xs[0]},${areaBottom} ${pts} ${xs[n - 1]},${areaBottom}`

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.015em' }}>{title}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)', letterSpacing: '0.06em' }}>
          {data[0].label} → {data[n - 1].label}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${TOTAL_H}`} style={{ width: '100%' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.15} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        <g stroke="rgba(0,0,0,0.05)" strokeWidth={1}>
          <line x1={40} y1={24 + CHART_H * 0.25} x2={W - 40} y2={24 + CHART_H * 0.25} />
          <line x1={40} y1={24 + CHART_H * 0.75} x2={W - 40} y2={24 + CHART_H * 0.75} />
        </g>
        {showArea && <polygon points={area} fill={`url(#${gradId})`} />}
        <polyline fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" points={pts} />
        {xs.map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={ys[i]} r={i === n - 1 ? 5 : 3}
              fill={stroke}
              stroke={i === n - 1 ? 'white' : stroke}
              strokeWidth={i === n - 1 ? 2 : 0}
            />
            {showValues && (
              <text x={x} y={ys[i] - 9} textAnchor="middle"
                fontFamily="var(--font-mono)" fontSize={9} fill="var(--color-ink-3)">
                {data[i].value}{unit ? ` ${unit}` : ''}
              </text>
            )}
          </g>
        ))}
        <g fontFamily="var(--font-mono)" fontSize={9} fill="#A8A8A8">
          {data.map((d, i) => (
            <text key={i} x={xs[i]} y={TOTAL_H - 4} textAnchor="middle">{d.label}</text>
          ))}
        </g>
      </svg>
    </div>
  )
}
