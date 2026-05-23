'use client'

import { IconDownload } from '@tabler/icons-react'
import PageHeader, { Btn } from '@/components/detail/PageHeader'
import CohortBand from '@/components/detail/CohortBand'
import MiniLineChart from '@/components/detail/MiniLineChart'

// Body path in 0–200 space (x: 32–168, y: 12–346)
const BODY_PATH = `M 100 12 C 88 12 78 22 78 34 C 78 46 88 56 100 56 C 112 56 122 46 122 34 C 122 22 112 12 100 12 Z M 72 62 C 58 64 46 72 42 86 L 32 130 C 30 140 36 150 46 152 L 52 154 L 48 210 L 40 320 C 38 332 44 342 54 344 L 68 346 C 76 346 82 340 84 332 L 96 258 L 104 258 L 116 332 C 118 340 124 346 132 346 L 146 344 C 156 342 162 332 160 320 L 152 210 L 148 154 L 154 152 C 164 150 170 140 168 130 L 158 86 C 154 72 142 64 128 62 C 120 60 112 58 100 58 C 88 58 80 60 72 62 Z`

// SVG viewBox "0 0 380 400": body center → x=190 (TX=90), y starts at 27 (TY=15)
const TX = 90, TY = 15

// ─── Body silhouette — single SVG with embedded annotations ──────────────────
function BodySilhouette() {
  return (
    <svg viewBox="0 0 380 400" style={{ width: '100%', display: 'block' }}>
      <defs>
        <clipPath id="body-clip">
          <path d={BODY_PATH} transform={`translate(${TX}, ${TY})`} />
        </clipPath>
      </defs>

      {/* Strata — full-width rects clipped to body shape */}
      {/* OS / Amber — head (≈top 15%) */}
      <rect x={0} y={0} width={380} height={TY + 60} fill="var(--color-amber-soft)" clipPath="url(#body-clip)" />
      {/* GRAS / Rust — upper torso */}
      <rect x={0} y={TY + 60} width={380} height={100} fill="var(--color-rust-soft)" clipPath="url(#body-clip)" />
      {/* MUSCLE / Lichen — lower torso */}
      <rect x={0} y={TY + 160} width={380} height={80} fill="var(--color-lichen-soft)" clipPath="url(#body-clip)" />
      {/* EAU / Aqua — legs */}
      <rect x={0} y={TY + 240} width={380} height={145} fill="var(--color-aqua-soft)" clipPath="url(#body-clip)" />

      {/* Body outline */}
      <path d={BODY_PATH} transform={`translate(${TX}, ${TY})`}
        fill="none" stroke="var(--color-line)" strokeWidth={1.5} />

      {/* ── Left annotations (OS, GRAS) ── */}

      {/* OS — head center y≈49 (34+TY). Head left edge: x=78+TX=168. */}
      <line x1={78} y1={49} x2={165} y2={49} stroke="var(--color-ink-4)" strokeWidth={0.5} />
      <text x={75} y={43} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} letterSpacing="0.08em" fill="var(--color-ink-4)">OS</text>
      <text x={75} y={57} textAnchor="end" fontFamily="Manrope, sans-serif" fontSize={11} fontWeight="600" fill="var(--color-ink)">3,2 kg</text>

      {/* GRAS — upper torso y≈125 (110+TY). Torso left at original y=110: x≈37 → SVG x=127. */}
      <line x1={78} y1={125} x2={124} y2={125} stroke="var(--color-ink-4)" strokeWidth={0.5} />
      <text x={75} y={119} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} letterSpacing="0.08em" fill="var(--color-ink-4)">GRAS</text>
      <text x={75} y={133} textAnchor="end" fontFamily="Manrope, sans-serif" fontSize={11} fontWeight="600" fill="var(--color-ink)">15,2%</text>

      {/* ── Right annotations (MUSCLE, EAU) ── */}

      {/* MUSCLE — upper-leg y≈210 (195+TY). Right outer at original y=195: x≈151 → SVG x=241. */}
      <line x1={244} y1={210} x2={302} y2={210} stroke="var(--color-ink-4)" strokeWidth={0.5} />
      <text x={305} y={204} textAnchor="start" fontFamily="var(--font-mono)" fontSize={9} letterSpacing="0.08em" fill="var(--color-ink-4)">MUSCLE</text>
      <text x={305} y={218} textAnchor="start" fontFamily="Manrope, sans-serif" fontSize={11} fontWeight="600" fill="var(--color-ink)">58,1 kg</text>

      {/* EAU — lower-leg y≈305 (290+TY). Right outer at original y=290: x≈158 → SVG x=248. */}
      <line x1={251} y1={305} x2={302} y2={305} stroke="var(--color-ink-4)" strokeWidth={0.5} />
      <text x={305} y={299} textAnchor="start" fontFamily="var(--font-mono)" fontSize={9} letterSpacing="0.08em" fill="var(--color-ink-4)">EAU</text>
      <text x={305} y={313} textAnchor="start" fontFamily="Manrope, sans-serif" fontSize={11} fontWeight="600" fill="var(--color-ink)">61,2%</text>
    </svg>
  )
}

// ─── Stat cards ────────────────────────────────────────────────────────────────
const STATS = [
  { label: 'Poids', value: '73,2', unit: 'kg', sub: '−0,8 kg vs janv.', ok: true },
  { label: 'Masse grasse', value: '15,2', unit: '%', sub: '11,1 kg · objectif <13%', ok: false },
  { label: 'Masse maigre', value: '58,1', unit: 'kg', sub: '+1,4 kg en 6 mois', ok: true },
  { label: 'MB', value: '1 820', unit: 'kcal', sub: 'Métabolisme basal', ok: true },
]

function StatCard({ label, value, unit, sub, ok }: typeof STATS[0]) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 14, padding: '16px 20px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 8 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 30, fontWeight: 200, letterSpacing: '-0.03em', color: ok ? 'var(--color-ink)' : 'var(--color-rust)' }}>{value}</span>
        <span style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>{unit}</span>
      </div>
      <p style={{ fontSize: 10, color: 'var(--color-ink-4)', marginTop: 5 }}>{sub}</p>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function CompositionPage() {
  const evolSeries = [
    { values: [74.8, 74.2, 73.9, 74.0, 73.2] as [number, number, number, number, number], color: 'var(--color-ink)', label: 'Poids (kg)' },
    { values: [16.1, 15.9, 15.6, 15.4, 15.2] as [number, number, number, number, number], color: 'var(--color-rust)', label: 'Masse grasse (%)' },
  ]

  return (
    <div style={{ padding: '32px 56px 80px' }}>
      <PageHeader
        section="Composition corporelle"
        title={<>Composition <strong style={{ fontWeight: 700 }}>corporelle</strong></>}
        sub="6 mesures Withings · dernier bilan : 20 mai 2026. Masse grasse en baisse régulière, masse maigre progresse. Objectif <13% MG d'ici septembre."
        actions={<Btn><IconDownload size={14} />Exporter</Btn>}
      />

      {/* Hero: silhouette + stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 48, alignItems: 'start' }}>
        {/* Silhouette panel */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '32px 36px 40px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 28, textAlign: 'center' }}>
            Bilan du 20 mai 2026
          </p>
          <BodySilhouette />
          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 28 }}>
            {[
              { fill: 'var(--color-amber-soft)', stroke: 'var(--color-amber)', label: 'Os' },
              { fill: 'var(--color-rust-soft)', stroke: 'var(--color-rust)', label: 'Graisse' },
              { fill: 'var(--color-lichen-soft)', stroke: 'var(--color-lichen)', label: 'Muscle' },
              { fill: 'var(--color-aqua-soft)', stroke: 'var(--color-aqua)', label: 'Eau' },
            ].map(l => (
              <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em', color: 'var(--color-ink-3)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: l.fill, border: `1px solid ${l.stroke}` }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>

        {/* Stats + cohort */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {STATS.map(s => <StatCard key={s.label} {...s} />)}
          </div>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
            <CohortBand
              percentile={78}
              label="Score composition vs cohorte"
              context={<>Cohorte <strong>hommes actifs 28–34</strong> · médiane <strong>50ᵉ</strong>. Très bonne composition — masse grasse légèrement au-dessus de l'optimum athlétique.</>}
            />
          </div>
        </div>
      </div>

      {/* Evolution chart (placeholder — stacked bars à venir) */}
      <MiniLineChart
        title="Évolution composition — 6 derniers mois (Withings)"
        series={evolSeries}
        dates={['Oct 25', 'Déc 25', 'Fév 26', 'Avr 26', 'Mai 26']}
      />
    </div>
  )
}
