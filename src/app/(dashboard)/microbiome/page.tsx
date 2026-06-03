'use client'

import { usePersonaData, usePersonaContext } from '@/lib/context/PersonaContext'
import EmptyState from '@/components/EmptyState'
import PageHeader, { Btn } from '@/components/detail/PageHeader'
import CohortBand from '@/components/detail/CohortBand'
import PageSummary from '@/components/detail/PageSummary'
import LockedPageOverlay from '@/components/LockedPageOverlay'
import { useAccount } from '@/lib/context/useAccount'
import { IconDownload } from '@tabler/icons-react'

// ─── Donut chart data ─────────────────────────────────────────────────────────
type Phylum = { name: string; pct: number; color: string }

// SVG donut — viewBox 200x200, center 100,100, r=70
function DonutChart({ phyla, shannon }: { phyla: Phylum[]; shannon: number }) {
  const r = 70
  const cx = 100, cy = 100
  const C = 2 * Math.PI * r
  let offset = 0

  const slices = phyla.map(p => {
    const len = (p.pct / 100) * C
    const slice = { ...p, dasharray: `${len} ${C - len}`, dashoffset: -offset }
    offset += len
    return slice
  })

  return (
    <div style={{ position: 'relative', width: 200, height: 200 }}>
      <svg viewBox="0 0 200 200" width={200} height={200}>
        {slices.map(s => (
          <circle
            key={s.name}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={28}
            strokeDasharray={s.dasharray}
            strokeDashoffset={s.dashoffset}
            transform="rotate(-90 100 100)"
          />
        ))}
        {/* Center hole */}
        <circle cx={cx} cy={cy} r={56} fill="var(--color-surface)" />
      </svg>
      {/* Center label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-ink-4)' }}>Shannon</div>
        <div style={{ fontSize: 28, fontWeight: 200, letterSpacing: '-0.04em', lineHeight: 1.1, color: 'var(--color-ink)' }}>{shannon.toFixed(2)}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)' }}>indice</div>
      </div>
    </div>
  )
}

// ─── Bacteria list ────────────────────────────────────────────────────────────
type Bacterium = { name: string; role: string; pct: number; status: 'optimal' | 'warn' | 'low'; color: string }

function BacteriaRow({ b }: { b: Bacterium }) {
  const statusLabel = b.status === 'optimal' ? 'Optimal' : b.status === 'warn' ? 'Détecté' : 'Faible'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 80px', gap: 16, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--color-line)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, fontStyle: 'italic' }}>{b.name}</div>
        <div style={{ fontSize: 11, color: 'var(--color-ink-4)', marginTop: 2 }}>{b.role}</div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-ink-2)', textAlign: 'right' }}>
        {b.pct}%
      </div>
      <span style={{
        display: 'inline-flex', justifyContent: 'center',
        padding: '3px 10px', borderRadius: 999,
        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em',
        backgroundColor: b.status === 'optimal' ? 'var(--color-lichen-soft)' : b.status === 'warn' ? 'var(--color-rust-soft)' : 'var(--color-amber-soft)',
        color: b.color,
      }}>{statusLabel}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MicrobiomePage() {
  const data = usePersonaData()
  const { switchDemo, state } = usePersonaContext()
  const { isFree, isAdmin } = useAccount()

  if (isFree && !isAdmin && state.mode === 'real') {
    return <LockedPageOverlay feature="Microbiote" onViewDemo={() => switchDemo('john')} />
  }

  if (!data) {
    return (
      <div style={{ padding: '32px 56px 80px' }}>
        <EmptyState
          icon="bacteria"
          iconColor="amber"
          title="Pas encore d'analyse microbiote."
          body="Importe ton kit Viome, Luxia ou autre. Lyvio en extrait la diversité, les phyla et les espèces clés."
          primaryAction={{
            label: 'Importer un PDF',
            icon: 'upload',
            onClick: () => console.log('TODO: Phase 6 - Import PDF modal'),
          }}
          secondaryAction={{
            label: 'Voir le mode démo',
            onClick: () => switchDemo('john'),
          }}
        />
      </div>
    )
  }

  const microbiomeData = data.microbiomeData

  return (
    <div style={{ padding: '32px 56px 80px' }}>
      <PageHeader
        section="Microbiote"
        title={<>Micro<strong style={{ fontWeight: 700 }}>biote</strong></>}
        sub="Analyse du microbiote intestinal. "
        actions={<Btn><IconDownload size={14} />Exporter</Btn>}
      />
      <PageSummary text={data.pageSummaries.microbiome} />

      {/* Main layout: donut + legend + bacteria */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, marginBottom: 32 }}>
        {/* Donut panel */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', alignSelf: 'flex-start' }}>
            Composition phyla
          </p>
          <DonutChart phyla={microbiomeData.phyla} shannon={microbiomeData.shannon} />
          {/* Legend */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {microbiomeData.phyla.map(p => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-ink-2)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.color, flexShrink: 0 }} />
                  {p.name}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)' }}>{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bacteria list */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 16 }}>
            Espèces clés
          </p>
          {microbiomeData.bacteria.map((b: any) => <BacteriaRow key={b.name} b={b as Bacterium} />)}
        </div>
      </div>

      {/* Cohort band */}
      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
        <CohortBand
          percentile={microbiomeData.cohortPercentile}
          label="Score microbiote vs cohorte"
          context={<>Cohorte <strong>{data.profile.cohortLabel}</strong> · médiane <strong>50ᵉ</strong>.</>}
        />
      </div>
    </div>
  )
}
