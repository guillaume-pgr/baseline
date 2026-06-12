'use client'

import { useState } from 'react'
import { IconUpload, IconDownload, IconTrash } from '@tabler/icons-react'
import { usePersonaData, usePersonaContext, useRealPanels } from '@/lib/context/PersonaContext'
import EmptyState from '@/components/EmptyState'
import PageHeader, { Btn } from '@/components/detail/PageHeader'
import CohortBand from '@/components/detail/CohortBand'
import EvolutionMultiLineChart from '@/components/detail/EvolutionMultiLineChart'
import ImportModal from '@/components/ImportModal'
import { type BloodMarker, type BloodCategory, MARKER_EXPLANATIONS } from '@/data/bloodwork-data'
import PageSummary from '@/components/detail/PageSummary'

// ─── Gauge ───────────────────────────────────────────────────────────────────
// Curseur de position. Real data : échelle + zone optimale calculées par
// l'adapter (m.gauge, gère range/lt/gt/none). Démo : gradient fixe historique.
const FIXED_GRADIENT = 'linear-gradient(to right, var(--color-rust-soft) 0%, var(--color-rust-soft) 12%, var(--color-amber-soft) 12%, var(--color-amber-soft) 28%, var(--color-lichen-soft) 28%, var(--color-lichen-soft) 72%, var(--color-amber-soft) 72%, var(--color-amber-soft) 88%, var(--color-rust-soft) 88%, var(--color-rust-soft) 100%)'

function GaugeDot({ left, warn, size }: { left: number; warn: boolean; size: number }) {
  return (
    <div style={{
      position: 'absolute', top: '50%', left: `${left}%`, transform: 'translate(-50%, -50%)',
      width: size, height: size,
      backgroundColor: warn ? 'var(--color-rust)' : 'var(--color-ink)',
      border: '2px solid var(--color-surface)', borderRadius: '50%',
      boxShadow: size >= 10 ? '0 1px 3px rgba(0,0,0,0.15)' : undefined,
    }} />
  )
}

function GaugeBar({ m, dotSize }: { m: BloodMarker; dotSize: number }) {
  if (m.gauge) {
    const g = m.gauge
    const zoneWidth = Math.max(g.optimalEnd - g.optimalStart, 0) * 100
    return (
      <div style={{ position: 'relative', height: 4, borderRadius: 999, backgroundColor: 'var(--color-surface-3)' }}>
        {zoneWidth > 0 && (
          <div style={{ position: 'absolute', top: 0, left: `${g.optimalStart * 100}%`, width: `${zoneWidth}%`, height: '100%', backgroundColor: 'var(--color-lichen-soft)', borderRadius: 999 }} />
        )}
        <GaugeDot left={g.dot * 100} warn={m.warn} size={dotSize} />
      </div>
    )
  }
  // Fallback (seeds démo) : gradient fixe + position depuis range.
  const pct = Math.min(Math.max((m.value - m.range[0]) / (m.range[1] - m.range[0]), 0), 1) * 100
  return (
    <div style={{ position: 'relative', height: 4, borderRadius: 999, background: FIXED_GRADIENT }}>
      <GaugeDot left={pct} warn={m.warn} size={dotSize} />
    </div>
  )
}

// ─── Marker bar (gradient + cursor) ─────────────────────────────────────────
function MarkerRow({ m }: { m: BloodMarker }) {
  const trendColor = m.trendDir === 'up' ? '#5C7A4A' : m.trendDir === 'down' ? 'var(--color-rust)' : 'var(--color-ink-3)'

  return (
    <div style={{ borderBottom: '1px solid var(--color-line)' }}>
      {/* Desktop (≥md) — unchanged 4-column grid */}
      <div className="hidden md:grid" style={{
        gridTemplateColumns: '200px 1fr 110px 100px',
        gap: 20, alignItems: 'center', padding: '14px 0',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>{m.context}</div>
        </div>

        <div>
          <GaugeBar m={m} dotSize={10} />
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

      {/* Mobile (<md) — name+value on top, gauge full-width below */}
      <div className="md:hidden" style={{ padding: '12px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>{m.context}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500, color: m.warn ? 'var(--color-rust)' : 'var(--color-ink)' }}>
              {m.value.toString().replace('.', ',')}<span style={{ fontSize: 10, color: 'var(--color-ink-4)', marginLeft: 3 }}>{m.unit}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: trendColor, marginTop: 2 }}>{m.trendLabel}</div>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <GaugeBar m={m} dotSize={10} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', marginTop: 4 }}>
            {m.scaleLabels.map(l => <span key={l}>{l}</span>)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Marker row — exhaustive view (left 2/3 + right 1/3 explanation) ─────────
function MarkerRowExhaustive({ m }: { m: BloodMarker }) {
  const trendColor = m.trendDir === 'up' ? '#5C7A4A' : m.trendDir === 'down' ? 'var(--color-rust)' : 'var(--color-ink-3)'
  const explanation = m.explanation ?? MARKER_EXPLANATIONS[m.id]

  return (
    <div style={{ borderBottom: '1px solid var(--color-line)' }}>
      {/* Desktop (≥md) — unchanged: left 2/3 info + right 1/3 explanation */}
      <div className="hidden md:grid" style={{
        gridTemplateColumns: '2fr 1fr', gap: 24, alignItems: 'center', padding: '14px 0',
      }}>
        {/* Left 2/3: condensed marker info */}
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 90px 80px', gap: 12, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{m.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>{m.context}</div>
          </div>
          <div>
            <GaugeBar m={m} dotSize={8} />
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

        {/* Right 1/3: statut + explication */}
        <div style={{ paddingLeft: 16, borderLeft: '1px solid var(--color-line)' }}>
          <span style={{
            display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 9,
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6,
            color: m.warn ? 'var(--color-rust)' : '#5C7A4A',
          }}>
            {m.warn ? 'À surveiller' : 'Optimal'}
          </span>
          {explanation && (
            <p style={{ fontSize: 11, color: 'var(--color-ink-3)', lineHeight: 1.55, margin: 0 }}>
              {explanation}
            </p>
          )}
        </div>
      </div>

      {/* Mobile (<md) — stacked: name+value, gauge, status + explanation */}
      <div className="md:hidden" style={{ padding: '12px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>{m.context}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 500, color: m.warn ? 'var(--color-rust)' : 'var(--color-ink)' }}>
              {m.value.toString().replace('.', ',')}<span style={{ fontSize: 10, color: 'var(--color-ink-4)', marginLeft: 3 }}>{m.unit}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: trendColor, marginTop: 2 }}>{m.trendLabel}</div>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <GaugeBar m={m} dotSize={9} />
        </div>
        <div style={{ marginTop: 10 }}>
          <span style={{
            display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 9,
            letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5,
            color: m.warn ? 'var(--color-rust)' : '#5C7A4A',
          }}>
            {m.warn ? 'À surveiller' : 'Optimal'}
          </span>
          {explanation && (
            <p style={{ fontSize: 11, color: 'var(--color-ink-3)', lineHeight: 1.55, margin: 0 }}>
              {explanation}
            </p>
          )}
        </div>
      </div>
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
// Format an ISO date (YYYY-MM-DD) as DD/MM/YYYY.
function formatPanelDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function BloodworkPage() {
  const data = usePersonaData()
  const { switchDemo, state } = usePersonaContext()
  const { panels: realPanels, refetch } = useRealPanels()
  const [filter, setFilter] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const isReal = state.mode === 'real'

  // Import / deletion → re-read from the DB so the charts and history stay in sync.
  const handleImportSuccess = () => { refetch(); setRefreshKey(k => k + 1) }

  const handleDelete = async (panelId: string, dateLabel: string) => {
    if (!window.confirm(`Supprimer ce bilan du ${dateLabel} ?`)) return
    setDeletingId(panelId)
    try {
      const res = await fetch(`/api/health/panels/${panelId}`, { method: 'DELETE' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Erreur lors de la suppression')
      }
      refetch()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }


  // No data yet (real mode loading/empty, or demo mode with no data)
  if (!data) {
    return (
      <div className="px-[18px] pt-6 pb-24 md:px-14 md:pt-8 md:pb-20">
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
            label: 'Importer un PDF',
            icon: 'upload',
            onClick: () => setImportOpen(true),
          }}
          secondaryAction={{
            label: 'Voir le mode démo',
            onClick: () => switchDemo('john'),
          }}
        />
      </div>
    )
  }

  const categories = filter ? data.bloodwork.categories.filter(c => c.id === filter) : data.bloodwork.categories
  const hero = data.bloodworkHero
  const dates = Array.from(data.bloodwork.dates)

  return (
    <div className="px-[18px] pt-6 pb-24 md:px-14 md:pt-8 md:pb-20" key={refreshKey}>
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
      <div className="grid grid-cols-1 gap-8 px-5 py-6 mb-8 md:grid-cols-2 md:gap-12 md:px-10 md:py-9 md:mb-12" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, alignItems: 'center' }}>
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

      {/* Historique des bilans — real mode only */}
      {isReal && realPanels.length > 0 && (
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px', marginBottom: 32 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 16 }}>
            Historique des bilans · {realPanels.length}
          </p>
          {realPanels.map(({ panel, markers }) => {
            const dateLabel = formatPanelDate(panel.panel_date)
            return (
              <div
                key={panel.id}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-line)' }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-ink)' }}>{dateLabel}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-ink-4)', marginTop: 2 }}>
                    {panel.lab_name || 'Laboratoire'} · {markers.length} marqueur{markers.length > 1 ? 's' : ''}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(panel.id, dateLabel)}
                  disabled={deletingId === panel.id}
                  title="Supprimer ce bilan"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
                    padding: '6px 12px', borderRadius: 999, cursor: deletingId === panel.id ? 'default' : 'pointer',
                    border: '1px solid var(--color-line-2)', backgroundColor: 'transparent',
                    color: 'var(--color-rust)', opacity: deletingId === panel.id ? 0.5 : 1,
                  }}
                >
                  <IconTrash size={14} />
                  {deletingId === panel.id ? 'Suppression…' : 'Supprimer'}
                </button>
              </div>
            )
          })}
        </div>
      )}

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
