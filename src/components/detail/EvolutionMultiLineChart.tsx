'use client'

// Multi-series evolution chart — thin lines, small dots, area under first series.
// Each series normalized independently → trends visible regardless of unit difference.
// Valeur affichée AU-DESSUS de chaque point (peu de points) + tooltip au survol/tap.

import { useState } from 'react'

type PointStatus = 'optimal' | 'warn'

type Series = {
  label: string
  values: number[]
  color: string  // hex or CSS var
  unit?: string  // unité du marqueur (ex. "g/L") — affichée avec chaque valeur
  statuses?: PointStatus[] // statut par point (vs intervalle) — pour le tooltip
}

type EvolutionMultiLineChartProps = {
  title: string
  series: Series[]
  dates: string[]
  id: string
}

// Format FR : virgule décimale (2.31 → "2,31").
function fr(v: number): string {
  return String(v).replace('.', ',')
}

// Normalize one series to [0.3H, 1.1H] range, independently of other series.
// A flat or single-point series is centred so it renders cleanly.
function normalizeSeries(values: number[], H: number): number[] {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  if (range === 0) return values.map(() => H * 0.5)
  return values.map(v => H - ((v - min) / range) * H * 0.8 + H * 0.1)
}

// Build a closed area path: rise along curve, descend to areaBottom, return.
function buildAreaPath(xs: number[], ys: number[], areaBottom: number): string {
  const pts = xs.map((x, i) => `L ${x},${ys[i]}`).join(' ')
  return `M ${xs[0]},${areaBottom} ${pts} L ${xs[xs.length - 1]},${areaBottom} Z`
}

const W = 700, CHART_H = 120, TOTAL_H = 168

export default function EvolutionMultiLineChart({
  title, series, dates, id,
}: EvolutionMultiLineChartProps) {
  // Point survolé / tapé : { si: index série, i: index point }.
  const [hovered, setHovered] = useState<{ si: number; i: number } | null>(null)

  const n = dates.length
  // Single point → centre it; otherwise spread evenly across the width.
  const step = n > 1 ? (W - 80) / (n - 1) : 0
  const xs = n > 1 ? dates.map((_, i) => 40 + i * step) : [W / 2]
  const gradId = `evol-multi-${id}`

  // Each series normalized on its own scale so trends are always visible
  const ysByS = series.map(s => normalizeSeries(s.values, CHART_H))

  // Area under primary series: descends to its lowest visible point + 8px breathing room
  const primaryYs = ysByS[0]
  const areaBottom = Math.max(...primaryYs) + 8
  const primaryColor = series[0]?.color ?? 'var(--color-ink)'
  const areaPath = buildAreaPath(xs, primaryYs, areaBottom)

  const active = hovered ? series[hovered.si] : null
  const activeUnit = active?.unit ? ` ${active.unit}` : ''
  const activeStatus = active?.statuses?.[hovered!.i]

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.015em' }}>{title}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
          {dates[0]} → {dates[n - 1]}
        </span>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        {series.map(s => (
          <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.05em', color: 'var(--color-ink-3)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
            {s.label}{s.unit ? ` · ${s.unit}` : ''}
          </span>
        ))}
      </div>

      {/* Graphe + tooltip overlay (position en % → robuste au scaling SVG) */}
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${TOTAL_H}`} style={{ width: '100%', display: 'block' }}>
          <defs>
            {/* objectBoundingBox (default): gradient fills bounding box of the area path */}
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={primaryColor} stopOpacity={0.20} />
              <stop offset="100%" stopColor={primaryColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* Subtle grid */}
          <g stroke="rgba(0,0,0,0.05)" strokeWidth={1}>
            <line x1={40} y1={24 + CHART_H * 0.25} x2={W - 40} y2={24 + CHART_H * 0.25} />
            <line x1={40} y1={24 + CHART_H * 0.75} x2={W - 40} y2={24 + CHART_H * 0.75} />
          </g>
          {/* Area under primary series */}
          <path d={areaPath} fill={`url(#${gradId})`} />
          {/* Lines + dots + valeurs par point */}
          {series.map((s, si) => {
            const ys = ysByS[si]
            const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
            return (
              <g key={s.label}>
                <polyline fill="none" stroke={s.color} strokeWidth={1.5}
                  strokeLinecap="round" strokeLinejoin="round" points={pts} />
                {xs.map((x, i) => {
                  const isHover = hovered?.si === si && hovered?.i === i
                  return (
                    <g key={i}>
                      {/* Valeur au-dessus du point — toujours visible */}
                      <text x={x} y={ys[i] - 9} textAnchor="middle"
                        fontFamily="var(--font-mono)" fontSize={9} fontWeight={isHover ? 700 : 400}
                        fill="var(--color-ink-2)">
                        {fr(s.values[i])}{s.unit ? ` ${s.unit}` : ''}
                      </text>
                      <circle cx={x} cy={ys[i]} r={isHover ? 5 : (i === n - 1 ? 4 : 3)}
                        fill={s.color}
                        stroke={isHover || i === n - 1 ? 'white' : s.color}
                        strokeWidth={isHover || i === n - 1 ? 1.5 : 0}
                      />
                      {/* Zone de survol/tap élargie (invisible) */}
                      <circle cx={x} cy={ys[i]} r={16} fill="transparent" style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHovered({ si, i })}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => setHovered(prev => (prev?.si === si && prev?.i === i ? null : { si, i }))}
                      />
                    </g>
                  )
                })}
              </g>
            )
          })}
          {/* X labels (dates) */}
          <g fontFamily="var(--font-mono)" fontSize={9} fill="#A8A8A8">
            {dates.map((d, i) => (
              <text key={i} x={xs[i]} y={TOTAL_H - 4} textAnchor="middle">{d}</text>
            ))}
          </g>
        </svg>

        {/* Tooltip : valeur + date + statut vs intervalle */}
        {active && (
          <div
            style={{
              position: 'absolute', top: 0, left: `${(xs[hovered!.i] / W) * 100}%`,
              transform: 'translateX(-50%)', pointerEvents: 'none',
              backgroundColor: 'var(--color-ink)', color: 'var(--color-bg)',
              borderRadius: 8, padding: '8px 10px', minWidth: 96, textAlign: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)', zIndex: 2,
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em', color: 'var(--color-ink-5)' }}>
              {dates[hovered!.i]}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
              {fr(active.values[hovered!.i])}{activeUnit}
            </div>
            {activeStatus && (
              <div style={{
                marginTop: 4, display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 8,
                letterSpacing: '0.06em', textTransform: 'uppercase', padding: '2px 7px', borderRadius: 999,
                backgroundColor: activeStatus === 'optimal' ? 'var(--color-lichen)' : 'var(--color-rust)',
                color: 'white',
              }}>
                {activeStatus === 'optimal' ? 'Optimal' : 'À surveiller'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
