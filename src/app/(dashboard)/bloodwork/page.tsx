'use client'

import { useState } from 'react'
import { IconUpload, IconDownload } from '@tabler/icons-react'
import { usePersonaData, usePersonaContext } from '@/lib/context/PersonaContext'
import { useSession } from '@/lib/context/SessionContext'
import { useRealBloodPanels } from '@/lib/context/useRealBloodPanels'
import EmptyState from '@/components/EmptyState'
import PageHeader, { Btn } from '@/components/detail/PageHeader'
import CohortBand from '@/components/detail/CohortBand'
import EvolutionMultiLineChart from '@/components/detail/EvolutionMultiLineChart'
import ImportModal from '@/components/ImportModal'
import { type BloodMarker, type BloodCategory, MARKER_EXPLANATIONS } from '@/data/bloodwork-data'
import PageSummary from '@/components/detail/PageSummary'

// ─── Real mode marker row (DB schema) ────────────────────────────────────────
type RealMarker = {
  id: string; marker_code: string; marker_name: string
  value: number; unit: string; ref_min: number | null; ref_max: number | null
  status: string | null
}

function RealMarkerRow({ m }: { m: RealMarker }) {
  const hasRef = m.ref_min !== null && m.ref_max !== null
  const pct = hasRef
    ? Math.min(Math.max((m.value - m.ref_min!) / (m.ref_max! - m.ref_min!), 0), 1) * 100
    : 50
  const warn = m.status === 'danger' || m.status === 'warning'
  const statusColors: Record<string, { bg: string; text: string }> = {
    optimal:    { bg: 'var(--color-lichen-soft)', text: '#5C7A4A' },
    warning:    { bg: 'var(--color-amber-soft)',  text: '#8B5A00' },
    danger:     { bg: 'var(--color-rust-soft)',   text: 'var(--color-rust)' },
    low_normal: { bg: 'var(--color-amber-soft)',  text: '#8B5A00' },
    high_normal:{ bg: 'var(--color-amber-soft)',  text: '#8B5A00' },
  }
  const sc = statusColors[m.status ?? ''] ?? { bg: 'var(--color-surface-2)', text: 'var(--color-ink-3)' }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 110px 100px', gap: 20, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--color-line)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{m.marker_name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>{m.marker_code}</div>
      </div>
      <div>
        {hasRef ? (
          <>
            <div style={{ position: 'relative', height: 4, borderRadius: 999, background: 'linear-gradient(to right, var(--color-rust-soft) 0%, var(--color-rust-soft) 12%, var(--color-amber-soft) 12%, var(--color-amber-soft) 28%, var(--color-lichen-soft) 28%, var(--color-lichen-soft) 72%, var(--color-amber-soft) 72%, var(--color-amber-soft) 88%, var(--color-rust-soft) 88%, var(--color-rust-soft) 100%)' }}>
              <div style={{ position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)', width: 10, height: 10, backgroundColor: warn ? 'var(--color-rust)' : 'var(--color-ink)', border: '2px solid var(--color-surface)', borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', marginTop: 4 }}>
              <span>{m.ref_min}</span><span>{m.ref_max}</span>
            </div>
          </>
        ) : <div style={{ height: 4, borderRadius: 999, backgroundColor: 'var(--color-surface-3)' }} />}
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: warn ? 'var(--color-rust)' : 'var(--color-ink)' }}>
          {m.value}
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-ink-4)', marginTop: 2 }}>{m.unit}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '3px 9px', borderRadius: 999, backgroundColor: sc.bg, color: sc.text }}>
          {m.status ?? '—'}
        </span>
      </div>
    </div>
  )
}

// ─── Marker bar (gradient + cursor) ─────────────────────────────────────────
function MarkerRow({ m }: { m: BloodMarker }) {
  const pct = Math.min(Math.max((m.value - m.range[0]) / (m.range[1] - m.range[0]), 0), 1) * 100
  const trendColor = m.trendDir === 'up' ? '#5C7A4A' : m.trendDir === 'down' ? 'var(--color-rust)' : 'var(--color-ink-3)'

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '200px 1fr 110px 100px',
      gap: 20, alignItems: 'center',
      padding: '14px 0', borderBottom: '1px solid var(--color-line)',
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>{m.context}</div>
      </div>

      <div>
        <div style={{ position: 'relative', height: 4, borderRadius: 999, background: 'linear-gradient(to right, var(--color-rust-soft) 0%, var(--color-rust-soft) 12%, var(--color-amber-soft) 12%, var(--color-amber-soft) 28%, var(--color-lichen-soft) 28%, var(--color-lichen-soft) 72%, var(--color-amber-soft) 72%, var(--color-amber-soft) 88%, var(--color-rust-soft) 88%, var(--color-rust-soft) 100%)' }}>
          <div style={{
            position: 'absolute', top: '50%', left: `${pct}%`,
            transform: 'translate(-50%, -50%)',
            width: 10, height: 10,
            backgroundColor: m.warn ? 'var(--color-rust)' : 'var(--color-ink)',
            border: '2px solid var(--color-surface)',
            borderRadius: '50%', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', marginTop: 4 }}>
          {m.scaleLabels.map(l => <span key={l}>{l}</span>)}
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 500, color: m.warn ? 'var(--color-rust)' : 'var(--color-ink)' }}>
          {m.value.toString().replace('.', ',')}
        </div>
        <div style={{ fontSize: 10, color: 'var(--color-ink-4)', marginTop: 2 }}>{m.unit}</div>
      </div>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textAlign: 'right', color: trendColor }}>
        {m.trendLabel}
      </div>
    </div>
  )
}

// ─── Marker row — exhaustive view (left 2/3 + right 1/3 explanation) ─────────
function MarkerRowExhaustive({ m }: { m: BloodMarker }) {
  const pct = Math.min(Math.max((m.value - m.range[0]) / (m.range[1] - m.range[0]), 0), 1) * 100
  const trendColor = m.trendDir === 'up' ? '#5C7A4A' : m.trendDir === 'down' ? 'var(--color-rust)' : 'var(--color-ink-3)'
  const explanation = MARKER_EXPLANATIONS[m.id]

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '2fr 1fr',
      gap: 24, alignItems: 'center',
      padding: '14px 0', borderBottom: '1px solid var(--color-line)',
    }}>
      {/* Left 2/3: condensed marker info */}
      <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 90px 80px', gap: 12, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500 }}>{m.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>{m.context}</div>
        </div>
        <div>
          <div style={{ position: 'relative', height: 4, borderRadius: 999, background: 'linear-gradient(to right, var(--color-rust-soft) 0%, var(--color-rust-soft) 12%, var(--color-amber-soft) 12%, var(--color-amber-soft) 28%, var(--color-lichen-soft) 28%, var(--color-lichen-soft) 72%, var(--color-amber-soft) 72%, var(--color-amber-soft) 88%, var(--color-rust-soft) 88%, var(--color-rust-soft) 100%)' }}>
            <div style={{
              position: 'absolute', top: '50%', left: `${pct}%`,
              transform: 'translate(-50%, -50%)',
              width: 8, height: 8,
              backgroundColor: m.warn ? 'var(--color-rust)' : 'var(--color-ink)',
              border: '2px solid var(--color-surface)',
              borderRadius: '50%',
            }} />
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500, color: m.warn ? 'var(--color-rust)' : 'var(--color-ink)' }}>
            {m.value.toString().replace('.', ',')}
          </div>
          <div style={{ fontSize: 9, color: 'var(--color-ink-4)', marginTop: 2 }}>{m.unit}</div>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, textAlign: 'right', color: trendColor }}>
          {m.trendLabel}
        </div>
      </div>

      {/* Right 1/3: explanation */}
      {explanation && (
        <p style={{
          fontSize: 11,
          color: 'var(--color-ink-3)',
          lineHeight: 1.55,
          margin: 0,
          paddingLeft: 16,
          borderLeft: '1px solid var(--color-line)',
        }}>
          {explanation}
        </p>
      )}
    </div>
  )
}

// ─── Category card ───────────────────────────────────────────────────────────
// Alt colors for multi-series: primary color + 3 softer biotech tones
const MULTI_COLORS = ['#B5705A', '#7BA8B5', '#9CB380', '#9890B5']

function CategoryCard({ cat, dates, exhaustive }: { cat: BloodCategory; dates: string[]; exhaustive?: boolean }) {
  const chartSeries = cat.chartMarkerIds.map((markerId, i) => {
    const m = cat.markers.find(x => x.id === markerId)!
    const color = cat.chartMarkerIds.length > 1
      ? (MULTI_COLORS[i] ?? cat.chartColor)
      : cat.chartColor
    return { label: m.name, values: Array.from(m.history), color }
  })

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px', marginBottom: 16 }}>
      {/* Panel header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid var(--color-line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: cat.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: cat.iconColor }} />
          </div>
          {cat.name}
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em',
          padding: '4px 10px', borderRadius: 999,
          backgroundColor: cat.status === 'ok' ? 'var(--color-lichen-soft)' : 'var(--color-rust-soft)',
          color: cat.status === 'ok' ? '#5C7A4A' : 'var(--color-rust)',
        }}>
          {cat.statusLabel}
        </span>
      </div>

      {/* Marker rows */}
      <div>
        {cat.markers.map(m => (
          exhaustive
            ? <MarkerRowExhaustive key={m.id} m={m} />
            : <MarkerRow key={m.id} m={m} />
        ))}
      </div>

      {/* Inline evolution chart — only in category (non-exhaustive) view */}
      {!exhaustive && (
        <div style={{ marginTop: 24 }}>
          <EvolutionMultiLineChart
            id={cat.id}
            title={cat.chartTitle}
            series={chartSeries}
            dates={dates}
          />
        </div>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function BloodworkPage() {
  const data = usePersonaData()
  const { state } = usePersonaContext()
  const { profile } = useSession()
  const { panels: realPanels, isLoading: realLoading } = useRealBloodPanels()
  const [filter, setFilter] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleImportSuccess = () => {
    setRefreshKey(k => k + 1)
  }

  const isRealMode = state.mode === 'real' && profile
  const hasRealData = realPanels && realPanels.length > 0

  // ── Real mode: loading ─────────────────────────────────────────────────────
  if (isRealMode && !hasRealData && realLoading) {
    return (
      <div style={{ padding: '32px 56px 80px', color: 'var(--color-ink-3)', fontSize: 13 }}>
        Chargement…
      </div>
    )
  }

  // ── Real mode: no data ─────────────────────────────────────────────────────
  if (isRealMode && !hasRealData) {
    return (
      <div style={{ padding: '32px 56px 80px' }}>
        <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onSuccess={handleImportSuccess} />
        <EmptyState
          icon="droplet"
          iconColor="rust"
          title="Pas encore de prise de sang importée."
          body="Importe un fichier CSV ou PDF avec tes marqueurs. Lyvio les structure automatiquement et te situe face à ta cohorte."
          primaryAction={{ label: 'Importer un bilan', icon: 'upload', onClick: () => setImportOpen(true) }}
          secondaryAction={{ label: 'Voir le mode démo', onClick: () => {} }}
        />
      </div>
    )
  }

  // ── Real mode: display data ────────────────────────────────────────────────
  if (isRealMode && hasRealData) {
    const latestPanel = realPanels[0]
    const optimal = latestPanel.markers.filter(m => m.status === 'optimal').length
    const total   = latestPanel.markers.length
    const panelDate = new Date(latestPanel.panel.panel_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

    // Group by organ_system
    const groups = latestPanel.markers.reduce<Record<string, typeof latestPanel.markers>>((acc, m) => {
      const key = m.organ_system || 'Autres'
      if (!acc[key]) acc[key] = []
      acc[key].push(m)
      return acc
    }, {})

    return (
      <div style={{ padding: '32px 56px 80px' }} key={refreshKey}>
        <ImportModal open={importOpen} onClose={() => setImportOpen(false)} onSuccess={handleImportSuccess} />

        <PageHeader
          section="Prises de sang"
          title={<>Prises de <strong style={{ fontWeight: 700 }}>sang</strong></>}
          sub={`${total} marqueurs · ${panelDate}.`}
          actions={
            <>
              <Btn><IconDownload size={14} />Exporter</Btn>
              <button onClick={() => setImportOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', backgroundColor: 'var(--color-ink)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                <IconUpload size={14} />Nouveau bilan
              </button>
            </>
          }
        />

        {/* Hero */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, padding: '36px 40px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, marginBottom: 32, alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 14 }}>
              Bilan du {panelDate}
            </p>
            <div style={{ fontSize: 92, fontWeight: 200, letterSpacing: '-0.05em', lineHeight: 0.9, color: 'var(--color-ink)', marginBottom: 8 }}>
              {optimal}<span style={{ fontSize: 48, color: 'var(--color-ink-3)', fontWeight: 300 }}>/{total}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '0.04em' }}>
              marqueurs dans la zone optimale
            </p>
          </div>
          <CohortBand
            percentile={Math.round((optimal / total) * 100)}
            warn={optimal / total < 0.5}
            label="Marqueurs optimaux"
            context={<>Résultats de ton bilan du <strong>{panelDate}</strong>.</>}
          />
        </div>

        {/* Groups */}
        {Object.entries(groups).map(([group, markers]) => (
          <div key={group} style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 16, borderBottom: '1px solid var(--color-line)' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{group}</div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.06em', padding: '4px 10px', borderRadius: 999, backgroundColor: 'var(--color-surface-2)', color: 'var(--color-ink-3)' }}>
                {markers.filter(m => m.status === 'optimal').length}/{markers.length} optimaux
              </span>
            </div>
            {markers.map(m => <RealMarkerRow key={m.id} m={m} />)}
          </div>
        ))}
      </div>
    )
  }

  // Display demo data (original behavior)
  if (!data) {
    return (
      <div style={{ padding: '32px 56px 80px' }}>
        <ImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          onSuccess={handleImportSuccess}
        />
        <EmptyState
          icon="droplet"
          iconColor="rust"
          title="Pas encore de prise de sang importée."
          body="Glisse un PDF de bilan sanguin. Lyvio en extrait tous les marqueurs automatiquement et te dit où tu te situes vs ta cohorte."
          primaryAction={{
            label: 'Importer un CSV',
            icon: 'upload',
            onClick: () => setImportOpen(true),
          }}
          secondaryAction={{
            label: 'Voir le mode démo',
            onClick: () => {},
          }}
        />
      </div>
    )
  }

  const categories = filter ? data.bloodwork.categories.filter(c => c.id === filter) : data.bloodwork.categories
  const hero = data.bloodworkHero
  const dates = Array.from(data.bloodwork.dates)

  return (
    <div style={{ padding: '32px 56px 80px' }} key={refreshKey}>
      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={handleImportSuccess}
      />
      <PageHeader
        section="Prises de sang"
        title={<>Prises de <strong style={{ fontWeight: 700 }}>sang</strong></>}
        sub={`${hero.total} marqueurs · dernier : ${hero.bilanDate}.`}
        actions={
          <>
            <Btn><IconDownload size={14} />Exporter</Btn>
            <button
              onClick={() => setImportOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                backgroundColor: 'black',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              <IconUpload size={14} />
              Importer un PDF
            </button>
          </>
        }
      />
      <PageSummary text={data.pageSummaries.bloodwork} />

      {/* Value hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, padding: '36px 40px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, marginBottom: 48, alignItems: 'center' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 14 }}>Bilan du {hero.bilanDate}</p>
          <div style={{ fontSize: 92, fontWeight: 200, letterSpacing: '-0.05em', lineHeight: 0.9, color: 'var(--color-ink)', marginBottom: 8 }}>
            {hero.optimal}<span style={{ fontSize: 48, color: 'var(--color-ink-3)', fontWeight: 300 }}>/{hero.total}</span>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '0.04em', marginBottom: 18 }}>marqueurs dans la zone optimale</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {hero.pills.map(p => (
              <span key={p.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 11px', borderRadius: 999,
                fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.04em',
                backgroundColor: p.ok ? 'var(--color-lichen-soft)' : 'var(--color-rust-soft)',
                color: p.ok ? '#5C7A4A' : 'var(--color-rust)',
              }}>{p.label}</span>
            ))}
          </div>
        </div>

        <CohortBand
          percentile={hero.cohortPercentile}
          warn={hero.cohortPercentile < 50}
          label="Score sang vs cohorte"
          context={<>Cohorte <strong>{data.profile.cohortLabel}</strong> · médiane <strong>50ᵉ</strong>.</>}
        />
      </div>

      {/* Toggle filter */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 12 }}>
          Filtrer par catégorie
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button
            onClick={() => setFilter(null)}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              border: '1px solid', transition: 'all 0.15s',
              borderColor: filter === null ? 'var(--color-ink)' : 'var(--color-line-2)',
              backgroundColor: filter === null ? 'var(--color-ink)' : 'transparent',
              color: filter === null ? 'var(--color-bg)' : 'var(--color-ink-2)',
            }}
          >
            Vue exhaustive
          </button>
          {data.bloodwork.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id === filter ? null : cat.id)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                border: '1px solid', transition: 'all 0.15s',
                borderColor: filter === cat.id ? cat.iconColor : 'var(--color-line-2)',
                backgroundColor: filter === cat.id ? cat.iconBg : 'transparent',
                color: filter === cat.id ? cat.iconColor : 'var(--color-ink-2)',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.map(cat => (
        <CategoryCard key={cat.id} cat={cat} dates={dates} exhaustive={filter === null} />
      ))}
    </div>
  )
}
