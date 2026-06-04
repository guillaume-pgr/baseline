'use client'

import { usePersonaData, usePersonaContext } from '@/lib/context/PersonaContext'
import EmptyState from '@/components/EmptyState'
import PageHeader, { Btn } from '@/components/detail/PageHeader'
import CohortBand from '@/components/detail/CohortBand'
import PageSummary from '@/components/detail/PageSummary'
import LockedPageOverlay from '@/components/LockedPageOverlay'
import { useAccount } from '@/lib/context/useAccount'
import { IconDownload } from '@tabler/icons-react'

// ─── VO2 gauge — 270° horseshoe arc open at bottom ───────────────────────────
const C270 = 2 * Math.PI * 110 * 0.75
const ARC = 'M 62.22 227.78 A 110 110 0 1 1 217.78 227.78'

function VO2Gauge({ vo2Value }: { vo2Value: number }) {
  const VO2_ACTIVE = ((vo2Value - 20) / 60) * C270

  return (
    <svg viewBox="0 0 280 280" width={280} height={280}>
      {/* Track (full 270° arc) */}
      <path d={ARC} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={11} strokeLinecap="round" />
      {/* Active arc */}
      <path d={ARC} fill="none" stroke="var(--color-aqua)" strokeWidth={11} strokeLinecap="round"
        strokeDasharray={`${VO2_ACTIVE.toFixed(2)} 10000`} />
      {/* Scale end labels */}
      <text x={62} y={249} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10} fill="var(--color-ink-4)">20</text>
      <text x={218} y={249} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10} fill="var(--color-ink-4)">80</text>
      {/* Center content */}
      <text x={140} y={100} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10} letterSpacing="0.16em" fill="var(--color-ink-4)">VO₂MAX</text>
      <text x={140} y={162} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={66} fontWeight="300" letterSpacing="-0.05em" fill="var(--color-ink)">{vo2Value.toFixed(1)}</text>
      <text x={140} y={180} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10} fill="var(--color-ink-3)">ml·kg⁻¹·min⁻¹</text>
      {/* Pill */}
      <rect x={92} y={196} width={96} height={22} rx={11} fill="var(--color-aqua-soft)" />
      <text x={140} y={211} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={10} letterSpacing="0.06em" fill="var(--color-aqua)">Excellent</text>
    </svg>
  )
}

// ─── Zone explanations ────────────────────────────────────────────────────────
const ZONE_EXPLANATIONS: Record<string, string> = {
  Z1: `Effort très léger. Favorise la récupération active et la circulation sans fatigue.`,
  Z2: `Base de l'endurance. Améliore l'utilisation des graisses et la santé cardiovasculaire de fond.`,
  Z3: `Effort modéré soutenu. Développe l'efficacité aérobie et repousse le seuil.`,
  Z4: `Proche du seuil lactique. Repousse la limite avant l'accumulation de fatigue.`,
  Z5: `Effort maximal. Sollicite la capacité aérobie maximale, à doser avec récupération.`,
}

// ─── Zone table ───────────────────────────────────────────────────────────────
function ZoneTable({ zones }: { zones: Array<{ zone: string; name: string; bpm: string; color: string; pct: number }> }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 16 }}>
        Zones cardio · 90 jours
      </p>
      {zones.map(z => (
        <div key={z.zone} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-line)' }}>
          {/* Left 2/3 — condensed zone info */}
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 80px 48px', gap: 10, alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: z.color }}>{z.zone}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{z.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)' }}>{z.bpm} bpm</div>
            </div>
            <div style={{ height: 5, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${z.pct}%`, backgroundColor: z.color, borderRadius: 999 }} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', textAlign: 'right' }}>{z.pct}%</span>
          </div>
          {/* Right 1/3 — explanation */}
          <p style={{ fontSize: 11, color: 'var(--color-ink-3)', lineHeight: 1.55, margin: 0, paddingLeft: 16, borderLeft: '1px solid var(--color-line)' }}>
            {ZONE_EXPLANATIONS[z.zone]}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AerobicPage() {
  const data = usePersonaData()
  const { switchDemo, state } = usePersonaContext()
  const { isFree, isAdmin } = useAccount()

  if (isFree && !isAdmin && state.mode === 'real') {
    return <LockedPageOverlay feature="Capacité aérobie" onViewDemo={() => switchDemo('john')} />
  }

  if (!data) {
    return (
      <div style={{ padding: '32px 56px 80px' }}>
        <EmptyState
          icon="activity"
          iconColor="aqua"
          title="Pas encore de mesure VO₂max."
          body="Connecte ta montre Garmin, Apple Watch ou Polar. La VO₂max est le meilleur prédicteur de longévité."
          primaryAction={{
            label: 'Connecter ma montre',
            icon: 'plug-connected',
            onClick: () => console.log('TODO: Phase 7 - OAuth watch'),
          }}
          secondaryAction={{
            label: 'Voir le mode démo',
            onClick: () => switchDemo('john'),
          }}
        />
      </div>
    )
  }

  const aerobicData = data.aerobicData
  const xs = [60, 185, 345, 510, 660]
  const min = 46, max = 55, H = 120
  const ys = aerobicData.history.map(v => H - ((v - min) / (max - min)) * H * 0.8 + H * 0.1)
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ')
  const area = `${xs[0]},${H + 4} ${pts} ${xs[xs.length - 1]},${H + 4}`

  return (
    <div style={{ padding: '32px 56px 80px' }}>
      <PageHeader
        section="Capacité aérobie"
        title={<>Capacité <strong style={{ fontWeight: 700 }}>aérobie</strong></>}
        sub={`Dernière mesure : ${aerobicData.historyDates[aerobicData.historyDates.length - 1]}.`}
        actions={<Btn><IconDownload size={14} />Exporter</Btn>}
      />
      <PageSummary text={data.pageSummaries.aerobic} />

      {/* Hero: gauge + cohort */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, padding: '36px 40px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, marginBottom: 32, alignItems: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <VO2Gauge vo2Value={aerobicData.vo2Value} />
        </div>
        <CohortBand
          percentile={aerobicData.cohortPercentile}
          label="VO₂max vs cohorte"
          context={<>Cohorte <strong>{data.profile.cohortLabel}</strong> · médiane <strong>50ᵉ</strong>.</>}
        />
      </div>

      {/* Zone table */}
      <div style={{ marginBottom: 32 }}>
        <ZoneTable zones={aerobicData.zones} />
      </div>

      {/* Evolution */}
      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 16 }}>
          Évolution VO₂max — {aerobicData.historyDates.length} derniers mois
        </p>
        <svg viewBox="0 0 700 160" style={{ width: '100%' }}>
          {/* Area fill */}
          <defs>
            <linearGradient id="aqua-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-aqua)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--color-aqua)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
                {aerobicData.history[i].toFixed(1)}
              </text>
            ))}
          </g>
          {/* X labels */}
          <g fontFamily="var(--font-mono)" fontSize={9} fill="#A8A8A8">
            {xs.map((x, i) => (
              <text key={i} x={x} y={150} textAnchor="middle">{aerobicData.historyDates[i]}</text>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
