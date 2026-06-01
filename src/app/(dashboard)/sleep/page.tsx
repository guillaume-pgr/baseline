'use client'

import { usePersonaData, usePersonaContext } from '@/lib/context/PersonaContext'
import EmptyState from '@/components/EmptyState'
import PageHeader, { Btn } from '@/components/detail/PageHeader'
import CohortBand from '@/components/detail/CohortBand'
import { IconDownload } from '@tabler/icons-react'

// ─── KPI cards ────────────────────────────────────────────────────────────────
type KPI = { label: string; value: string; unit: string; sub: string; ok: boolean }

function KpiCard({ label, value, unit, sub, ok }: KPI) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '20px 24px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 10 }}>{label}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 36, fontWeight: 200, letterSpacing: '-0.03em', color: ok ? 'var(--color-ink)' : 'var(--color-rust)' }}>{value}</span>
        {unit && <span style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>{unit}</span>}
      </div>
      <p style={{ fontSize: 11, color: 'var(--color-ink-4)', marginTop: 6 }}>{sub}</p>
    </div>
  )
}

// ─── Sleep stages bar ─────────────────────────────────────────────────────────
type Stage = { label: string; pct: number; color: string }

function SleepStagesBar({ stages }: { stages: Stage[] }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 16 }}>
        Stades de sommeil · moyenne 30 nuits
      </p>
      <div style={{ display: 'flex', height: 20, borderRadius: 999, overflow: 'hidden', marginBottom: 16 }}>
        {stages.map(s => (
          <div key={s.label} style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
        {stages.map(s => (
          <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-3)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: s.color, border: '1px solid var(--color-line)' }} />
            {s.label} <strong style={{ color: 'var(--color-ink-2)' }}>{s.pct}%</strong>
          </span>
        ))}
      </div>
      {stages.map(s => (
        <div key={s.label} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 40px', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-line)' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink-2)' }}>{s.label}</span>
          <div style={{ height: 4, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${s.pct}%`, backgroundColor: s.color, borderRadius: 999 }} />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', textAlign: 'right' }}>{s.pct}%</span>
        </div>
      ))}
    </div>
  )
}

// ─── HRV evolution chart ──────────────────────────────────────────────────────
function HrvChart({ hrv, hrvDates }: { hrv: number[]; hrvDates: string[] }) {
  const xs = [60, 185, 345, 510, 660]
  const min = 55, max = 75, H = 120
  const ys = hrv.map(v => H - ((v - min) / (max - min)) * H * 0.8 + H * 0.1)
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ')

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>HRV nocturne — évolution {hrvDates.length} mois</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)' }}>{hrvDates[0]} → {hrvDates[hrvDates.length - 1]}</span>
      </div>
      <svg viewBox="0 0 700 160" style={{ width: '100%' }}>
        <defs>
          <linearGradient id="hrv-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-lavender)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--color-lavender)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <polygon points={`${xs[0]},${H + 4} ${pts} ${xs[xs.length - 1]},${H + 4}`} fill="url(#hrv-grad)" />
        <polyline fill="none" stroke="var(--color-lavender)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" points={pts} />
        {xs.map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={ys[i]} r={i === 4 ? 5 : 3.5}
              fill="var(--color-lavender)"
              stroke={i === 4 ? 'white' : 'var(--color-lavender)'}
              strokeWidth={i === 4 ? 2 : 0}
            />
            <text x={x} y={ys[i] - 10} fontFamily="var(--font-mono)" fontSize={9} fill="var(--color-ink-3)" textAnchor="middle">
              {hrv[i]}
            </text>
          </g>
        ))}
        <g fontFamily="var(--font-mono)" fontSize={9} fill="#A8A8A8">
          {xs.map((x, i) => (
            <text key={i} x={x} y={150} textAnchor="middle">{hrvDates[i]}</text>
          ))}
        </g>
      </svg>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SleepPage() {
  const data = usePersonaData()
  const { switchDemo } = usePersonaContext()

  if (!data) {
    return (
      <div style={{ padding: '32px 56px 80px' }}>
        <EmptyState
          icon="moon-stars"
          iconColor="lavender"
          title="Pas encore de données de sommeil."
          body="Oura, Garmin ou Apple Watch. Suis HRV, efficacité et stades de sommeil au quotidien."
          primaryAction={{
            label: 'Connecter mon tracker',
            icon: 'plug-connected',
            onClick: () => console.log('TODO: Phase 7 - OAuth tracker'),
          }}
          secondaryAction={{
            label: 'Voir le mode démo',
            onClick: () => switchDemo('john'),
          }}
        />
      </div>
    )
  }

  const sleepData = data.sleepData

  return (
    <div style={{ padding: '32px 56px 80px' }}>
      <PageHeader
        section="Sommeil & HRV"
        title={<>Sommeil <strong style={{ fontWeight: 700 }}>& HRV</strong></>}
        sub="Dernières données de sommeil."
        actions={<Btn><IconDownload size={14} />Exporter</Btn>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {sleepData.kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      <div style={{ marginBottom: 32 }}>
        <SleepStagesBar stages={sleepData.stages} />
      </div>

      <div style={{ marginBottom: 32 }}>
        <HrvChart hrv={sleepData.hrv} hrvDates={sleepData.hrvDates} />
      </div>

      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
        <CohortBand
          percentile={sleepData.cohortPercentile}
          label="Score sommeil vs cohorte"
          context={<>Cohorte <strong>{data.profile.cohortLabel}</strong> · médiane <strong>50ᵉ</strong>.</>}
        />
      </div>
    </div>
  )
}
