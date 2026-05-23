import PageHeader, { Btn } from '@/components/detail/PageHeader'
import CohortBand from '@/components/detail/CohortBand'
import { IconDownload } from '@tabler/icons-react'

// ─── VO2 gauge — horseshoe arc, value centered ────────────────────────────────
// Arc: M 30 200 A 110 110 0 1 1 250 200 → circle center (140,200)
// Value "52,0" placed at center of full viewBox (140,140) — above the arc opening
const C = 2 * Math.PI * 110
const VO2_VALUE = 52.0
const VO2_MAX_SCALE = 80
const VO2_MIN_SCALE = 20
const ratio = (VO2_VALUE - VO2_MIN_SCALE) / (VO2_MAX_SCALE - VO2_MIN_SCALE)
// 270° arc → active portion covers ratio * 270°
const arcLen = (ratio * (3 / 4)) * C
const trackOffset = C * (1 / 4) // 90° gap at bottom
const activeOffset = C - arcLen + trackOffset

function VO2Gauge() {
  return (
    <svg viewBox="0 0 280 280" width={280} height={280}>
      {/* Track */}
      <circle
        cx={140} cy={200} r={110}
        fill="none"
        stroke="rgba(0,0,0,0.07)"
        strokeWidth={14}
        strokeDasharray={`${C * 0.75} ${C * 0.25}`}
        strokeDashoffset={C * 0.25}
        strokeLinecap="round"
        transform="rotate(135 140 200)"
      />
      {/* Active arc */}
      <circle
        cx={140} cy={200} r={110}
        fill="none"
        stroke="var(--color-aqua)"
        strokeWidth={14}
        strokeDasharray={`${arcLen} ${C - arcLen}`}
        strokeDashoffset={C - arcLen + C * 0.25}
        strokeLinecap="round"
        transform="rotate(135 140 200)"
      />
      {/* Scale labels */}
      <text x={22} y={215} fontFamily="var(--font-mono)" fontSize={10} fill="var(--color-ink-4)" textAnchor="middle">{VO2_MIN_SCALE}</text>
      <text x={258} y={215} fontFamily="var(--font-mono)" fontSize={10} fill="var(--color-ink-4)" textAnchor="middle">{VO2_MAX_SCALE}</text>
      {/* Value centered inside arc */}
      <text x={140} y={108} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10} letterSpacing="0.16em" fill="var(--color-ink-4)">VO₂MAX</text>
      <text x={140} y={172} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={72} fontWeight="200" letterSpacing="-0.05em" fill="var(--color-ink)">52,0</text>
      <text x={140} y={190} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={11} fill="var(--color-ink-3)">ml·kg⁻¹·min⁻¹</text>
      {/* Badge */}
      <rect x={100} y={200} width={80} height={20} rx={10} fill="var(--color-aqua-soft)" />
      <text x={140} y={214} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10} letterSpacing="0.06em" fill="var(--color-aqua)">Excellent</text>
    </svg>
  )
}

// ─── Zone table ───────────────────────────────────────────────────────────────
const ZONES = [
  { zone: 'Z1', name: 'Récupération', bpm: '< 114', color: '#A8C5CD', pct: 18 },
  { zone: 'Z2', name: 'Endurance', bpm: '114–133', color: 'var(--color-aqua)', pct: 52 },
  { zone: 'Z3', name: 'Tempo', bpm: '133–152', color: 'var(--color-lichen)', pct: 20 },
  { zone: 'Z4', name: 'Seuil', bpm: '152–171', color: 'var(--color-amber)', pct: 8 },
  { zone: 'Z5', name: 'VO₂max', bpm: '> 171', color: 'var(--color-rust)', pct: 2 },
]

function ZoneTable() {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 16 }}>
        Zones cardio · 90 jours Garmin
      </p>
      {ZONES.map(z => (
        <div key={z.zone} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 90px 60px', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-line)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: z.color }}>{z.zone}</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{z.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)' }}>{z.bpm} bpm</div>
          </div>
          {/* Bar */}
          <div style={{ height: 5, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${z.pct}%`, backgroundColor: z.color, borderRadius: 999 }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', textAlign: 'right' }}>{z.pct}%</span>
        </div>
      ))}
    </div>
  )
}

// ─── 90-day VO2 evolution (SVG area chart) ────────────────────────────────────
const AEROBIC_HISTORY: [number, number, number, number, number] = [49.2, 50.1, 51.0, 51.6, 52.0]
const AEROBIC_DATES = ['Jan 26', 'Fév 26', 'Mar 26', 'Avr 26', 'Mai 26']

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AerobicPage() {
  return (
    <div style={{ padding: '32px 56px 80px' }}>
      <PageHeader
        section="Capacité aérobie"
        title={<>Capacité <strong style={{ fontWeight: 700 }}>aérobie</strong></>}
        sub="Données Garmin Forerunner 965 · dernière mesure : 18 mai 2026. VO₂max en progression constante (+2,8 pts en 5 mois). Top 5% cohorte athlètes."
        actions={<Btn><IconDownload size={14} />Exporter</Btn>}
      />

      {/* Hero: gauge + cohort */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, padding: '36px 40px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, marginBottom: 32, alignItems: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <VO2Gauge />
        </div>
        <CohortBand
          percentile={88}
          label="VO₂max vs cohorte"
          context={<>Cohorte <strong>hommes actifs 28–34</strong> · médiane <strong>47 ml·kg⁻¹·min⁻¹</strong>. Tu dépasses 88% de la cohorte — niveau athlète confirmé.</>}
        />
      </div>

      {/* Zone table */}
      <div style={{ marginBottom: 32 }}>
        <ZoneTable />
      </div>

      {/* Evolution */}
      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 16 }}>
          Évolution VO₂max — 5 derniers mois
        </p>
        <svg viewBox="0 0 700 160" style={{ width: '100%' }}>
          {/* Area fill */}
          <defs>
            <linearGradient id="aqua-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-aqua)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--color-aqua)" stopOpacity={0} />
            </linearGradient>
          </defs>
          {(() => {
            const xs = [60, 185, 345, 510, 660]
            const min = 46, max = 55, H = 120
            const ys = AEROBIC_HISTORY.map(v => H - ((v - min) / (max - min)) * H * 0.8 + H * 0.1)
            const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
            const area = `${xs[0]},${H + 4} ${pts} ${xs[xs.length - 1]},${H + 4}`
            return (
              <g>
                <polygon points={area} fill="url(#aqua-grad)" />
                <polyline fill="none" stroke="var(--color-aqua)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" points={pts} />
                {xs.map((x, i) => (
                  <circle key={i} cx={x} cy={ys[i]} r={i === 4 ? 5 : 3.5}
                    fill="var(--color-aqua)"
                    stroke={i === 4 ? 'white' : 'var(--color-aqua)'}
                    strokeWidth={i === 4 ? 2 : 0}
                  />
                ))}
                {xs.map((x, i) => (
                  <text key={`v${i}`} x={x} y={ys[i] - 10} fontFamily="var(--font-mono)" fontSize={9} fill="var(--color-ink-3)" textAnchor="middle">
                    {AEROBIC_HISTORY[i].toFixed(1)}
                  </text>
                ))}
              </g>
            )
          })()}
          {/* X labels */}
          <g fontFamily="var(--font-mono)" fontSize={9} fill="#A8A8A8">
            {[60, 185, 345, 510, 660].map((x, i) => (
              <text key={i} x={x} y={150} textAnchor="middle">{AEROBIC_DATES[i]}</text>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
