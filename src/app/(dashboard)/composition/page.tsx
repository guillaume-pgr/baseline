'use client'

import { IconDownload } from '@tabler/icons-react'
import { usePersonaData, usePersonaContext } from '@/lib/context/PersonaContext'
import EmptyState from '@/components/EmptyState'
import PageHeader, { Btn } from '@/components/detail/PageHeader'
import CohortBand from '@/components/detail/CohortBand'

// Body path in 0–200 space (x: 32–168, y: 12–346)
const BODY_PATH = `M 100 12 C 88 12 78 22 78 34 C 78 46 88 56 100 56 C 112 56 122 46 122 34 C 122 22 112 12 100 12 Z M 72 62 C 58 64 46 72 42 86 L 32 130 C 30 140 36 150 46 152 L 52 154 L 48 210 L 40 320 C 38 332 44 342 54 344 L 68 346 C 76 346 82 340 84 332 L 96 258 L 104 258 L 116 332 C 118 340 124 346 132 346 L 146 344 C 156 342 162 332 160 320 L 152 210 L 148 154 L 154 152 C 164 150 170 140 168 130 L 158 86 C 154 72 142 64 128 62 C 120 60 112 58 100 58 C 88 58 80 60 72 62 Z`

// SVG viewBox "0 0 380 400": body center → x=190 (TX=90), y starts at 27 (TY=15)
const TX = 90, TY = 15

// ─── Body silhouette — single SVG with embedded annotations ──────────────────
function BodySilhouette({ annotations }: { annotations: { os: string; gras: string; muscle: string; eau: string } }) {
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
      <text x={75} y={57} textAnchor="end" fontFamily="Manrope, sans-serif" fontSize={11} fontWeight="600" fill="var(--color-ink)">{annotations.os}</text>

      {/* GRAS — upper torso y≈125 (110+TY). Torso left at original y=110: x≈37 → SVG x=127. */}
      <line x1={78} y1={125} x2={124} y2={125} stroke="var(--color-ink-4)" strokeWidth={0.5} />
      <text x={75} y={119} textAnchor="end" fontFamily="var(--font-mono)" fontSize={9} letterSpacing="0.08em" fill="var(--color-ink-4)">GRAS</text>
      <text x={75} y={133} textAnchor="end" fontFamily="Manrope, sans-serif" fontSize={11} fontWeight="600" fill="var(--color-ink)">{annotations.gras}</text>

      {/* ── Right annotations (MUSCLE, EAU) ── */}

      {/* MUSCLE — upper-leg y≈210 (195+TY). Right outer at original y=195: x≈151 → SVG x=241. */}
      <line x1={244} y1={210} x2={302} y2={210} stroke="var(--color-ink-4)" strokeWidth={0.5} />
      <text x={305} y={204} textAnchor="start" fontFamily="var(--font-mono)" fontSize={9} letterSpacing="0.08em" fill="var(--color-ink-4)">MUSCLE</text>
      <text x={305} y={218} textAnchor="start" fontFamily="Manrope, sans-serif" fontSize={11} fontWeight="600" fill="var(--color-ink)">{annotations.muscle}</text>

      {/* EAU — lower-leg y≈305 (290+TY). Right outer at original y=290: x≈158 → SVG x=248. */}
      <line x1={251} y1={305} x2={302} y2={305} stroke="var(--color-ink-4)" strokeWidth={0.5} />
      <text x={305} y={299} textAnchor="start" fontFamily="var(--font-mono)" fontSize={9} letterSpacing="0.08em" fill="var(--color-ink-4)">EAU</text>
      <text x={305} y={313} textAnchor="start" fontFamily="Manrope, sans-serif" fontSize={11} fontWeight="600" fill="var(--color-ink)">{annotations.eau}</text>
    </svg>
  )
}

// ─── Stat cards ────────────────────────────────────────────────────────────────
type Stat = {
  label: string
  value: string
  unit: string
  sub: string
  ok: boolean
}

function StatCard({ label, value, unit, sub, ok }: Stat) {
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

function CompositionEvolutionChart({ musclePct, fatPct, evolution_dates }: { musclePct: number[]; fatPct: number[]; evolution_dates: string[] }) {
  const EVOL_W = 700, EVOL_H = 120, EVOL_TOTAL_H = 168
  const Y_MIN = 11, Y_MAX = 54

  function toY(v: number): number {
    return EVOL_H - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * EVOL_H * 0.8 + EVOL_H * 0.1
  }

  const n = evolution_dates.length
  const step = (EVOL_W - 80) / (n - 1)
  const xs = evolution_dates.map((_, i) => 40 + i * step)
  const muscleYs = musclePct.map(toY)
  const fatYs    = fatPct.map(toY)

  const musclePts = xs.map((x, i) => `${x},${muscleYs[i]}`).join(' ')
  const fatPts    = xs.map((x, i) => `${x},${fatYs[i]}`).join(' ')

  const muscleBottom = Math.max(...muscleYs) + 8
  const fatBottom    = Math.max(...fatYs) + 8
  const muscleArea = `M ${xs[0]},${muscleBottom} ` + xs.map((x, i) => `L ${x},${muscleYs[i]}`).join(' ') + ` L ${xs[n - 1]},${muscleBottom} Z`
  const fatArea    = `M ${xs[0]},${fatBottom} `    + xs.map((x, i) => `L ${x},${fatYs[i]}`).join(' ')    + ` L ${xs[n - 1]},${fatBottom} Z`

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.015em' }}>
          Évolution des proportions — 6 mesures
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)', letterSpacing: '0.06em' }}>
          {evolution_dates[0]} → {evolution_dates[evolution_dates.length - 1]}
        </span>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        {[
          { label: 'Muscle %', color: 'var(--color-lichen)' },
          { label: 'Gras %',   color: 'var(--color-rust)' },
        ].map(s => (
          <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.05em', color: 'var(--color-ink-3)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
            {s.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${EVOL_W} ${EVOL_TOTAL_H}`} style={{ width: '100%' }}>
        <defs>
          <linearGradient id="comp-muscle-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-lichen)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--color-lichen)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="comp-fat-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-rust)" stopOpacity={0.18} />
            <stop offset="100%" stopColor="var(--color-rust)" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Subtle grid */}
        <g stroke="rgba(0,0,0,0.05)" strokeWidth={1}>
          <line x1={40} y1={24 + EVOL_H * 0.25} x2={EVOL_W - 40} y2={24 + EVOL_H * 0.25} />
          <line x1={40} y1={24 + EVOL_H * 0.75} x2={EVOL_W - 40} y2={24 + EVOL_H * 0.75} />
        </g>
        {/* Area fills */}
        <path d={muscleArea} fill="url(#comp-muscle-grad)" />
        <path d={fatArea}    fill="url(#comp-fat-grad)" />
        {/* Muscle curve */}
        <polyline fill="none" stroke="var(--color-lichen)" strokeWidth={1.5}
          strokeLinecap="round" strokeLinejoin="round" points={musclePts} />
        {xs.map((x, i) => (
          <g key={`m${i}`}>
            <circle cx={x} cy={muscleYs[i]} r={i === n - 1 ? 4 : 3}
              fill="var(--color-lichen)"
              stroke={i === n - 1 ? 'white' : 'var(--color-lichen)'}
              strokeWidth={i === n - 1 ? 1.5 : 0}
            />
            <text x={x} y={muscleYs[i] - 7} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize={9} fill="#5C7A4A">
              {musclePct[i]}%
            </text>
          </g>
        ))}
        {/* Fat curve */}
        <polyline fill="none" stroke="var(--color-rust)" strokeWidth={1.5}
          strokeLinecap="round" strokeLinejoin="round" points={fatPts} />
        {xs.map((x, i) => (
          <g key={`f${i}`}>
            <circle cx={x} cy={fatYs[i]} r={i === n - 1 ? 4 : 3}
              fill="var(--color-rust)"
              stroke={i === n - 1 ? 'white' : 'var(--color-rust)'}
              strokeWidth={i === n - 1 ? 1.5 : 0}
            />
            <text x={x} y={fatYs[i] + 16} textAnchor="middle"
              fontFamily="var(--font-mono)" fontSize={9} fill="var(--color-rust)">
              {fatPct[i]}%
            </text>
          </g>
        ))}
        {/* X labels */}
        <g fontFamily="var(--font-mono)" fontSize={9} fill="#A8A8A8">
          {evolution_dates.map((d, i) => (
            <text key={i} x={xs[i]} y={EVOL_TOTAL_H - 4} textAnchor="middle">{d}</text>
          ))}
        </g>
      </svg>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function CompositionPage() {
  const data = usePersonaData()
  const { switchDemo } = usePersonaContext()

  if (!data) {
    return (
      <div style={{ padding: '32px 56px 80px' }}>
        <EmptyState
          icon="stretching"
          iconColor="lichen"
          title="Connecte ta balance ou ajoute une mesure."
          body="Withings, Garmin Index, ou saisie manuelle. Lyvio suit muscle, gras, eau et hydratation au fil du temps."
          primaryAction={{
            label: 'Connecter une balance',
            icon: 'plug-connected',
            onClick: () => console.log('TODO: Phase 7 - OAuth balance'),
          }}
          secondaryAction={{
            label: 'Voir le mode démo',
            onClick: () => switchDemo('john'),
          }}
        />
      </div>
    )
  }

  const compositionData = data.compositionData

  return (
    <div style={{ padding: '32px 56px 80px' }}>
      <PageHeader
        section="Composition corporelle"
        title={<>Composition <strong style={{ fontWeight: 700 }}>corporelle</strong></>}
        sub={`Dernier bilan : ${compositionData.bilanDate}.`}
        actions={<Btn><IconDownload size={14} />Exporter</Btn>}
      />

      {/* Hero: silhouette + stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 48, alignItems: 'start' }}>
        {/* Silhouette panel */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '32px 36px 40px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 28, textAlign: 'center' }}>
            Bilan du {compositionData.bilanDate}
          </p>
          <BodySilhouette annotations={compositionData.bodyAnnotations} />
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
            {compositionData.stats.map(s => <StatCard key={s.label} {...s} />)}
          </div>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
            <CohortBand
              percentile={compositionData.cohortPercentile}
              label="Score composition vs cohorte"
              context={<>Cohorte <strong>{data.profile.cohortLabel}</strong> · médiane <strong>50ᵉ</strong>.</>}
            />
          </div>
        </div>
      </div>

      <CompositionEvolutionChart
        musclePct={compositionData.evolution.musclePct}
        fatPct={compositionData.evolution.fatPct}
        evolution_dates={compositionData.evolution.dates}
      />
    </div>
  )
}
