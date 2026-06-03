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
import { type BloodMarker, type BloodCategory } from '@/data/bloodwork-data'
import PageSummary from '@/components/detail/PageSummary'

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

// ─── Category card ───────────────────────────────────────────────────────────
// Alt colors for multi-series: primary color + 3 softer biotech tones
const MULTI_COLORS = ['#B5705A', '#7BA8B5', '#9CB380', '#9890B5']

function CategoryCard({ cat, dates }: { cat: BloodCategory; dates: string[] }) {
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
        {cat.markers.map((m, i) => (
          <div key={m.id} style={{ borderBottom: i < cat.markers.length - 1 ? undefined : 'none' }}>
            <MarkerRow m={m} />
          </div>
        ))}
      </div>

      {/* Inline evolution chart */}
      <div style={{ marginTop: 24 }}>
        <EvolutionMultiLineChart
          id={cat.id}
          title={cat.chartTitle}
          series={chartSeries}
          dates={dates}
        />
      </div>
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

  // Check if user is in real mode with no data
  const isRealMode = state.mode === 'real' && profile
  const hasRealData = realPanels && realPanels.length > 0

  console.log('[bloodwork] render:', {
    isRealMode,
    hasRealData,
    realLoading,
    realPanelsLength: realPanels?.length,
    stateMode: state.mode,
    hasProfile: !!profile,
  })

  if (isRealMode && !hasRealData && realLoading) {
    return (
      <div style={{ padding: '32px 56px 80px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 20, borderRadius: 8, marginBottom: 20 }}>
          <p style={{ fontSize: 12 }}>🔄 Chargement des données...</p>
          <p style={{ fontSize: 11, color: 'var(--color-ink-4)', marginTop: 8 }}>
            [DEBUG] realLoading={realLoading.toString()}, realPanelsLength={realPanels?.length}
          </p>
        </div>
      </div>
    )
  }

  if (isRealMode && !hasRealData) {
    return (
      <div style={{ padding: '32px 56px 80px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', padding: 20, borderRadius: 8, marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: 'var(--color-rust)' }}>❌ Pas de données</p>
          <p style={{ fontSize: 11, color: 'var(--color-ink-4)', marginTop: 8 }}>
            [DEBUG] isRealMode={isRealMode.toString()}, hasRealData={hasRealData.toString()}, realPanelsLength={realPanels?.length}
          </p>
        </div>
        <ImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          onSuccess={handleImportSuccess}
        />
        <EmptyState
          icon="droplet"
          iconColor="rust"
          title="Pas encore de prise de sang importée."
          body="Importe un fichier CSV avec tes marqueurs. Lyvio en extrait tous les marqueurs automatiquement et te dit où tu te situes vs ta cohorte."
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

  // Display real data if available
  if (isRealMode && hasRealData) {
    const latestPanel = realPanels[0]
    return (
      <div style={{ padding: '32px 56px 80px' }} key={refreshKey}>
        <div style={{ backgroundColor: 'var(--color-lichen-soft)', padding: 20, borderRadius: 8, marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: '#5C7A4A' }}>✅ Données trouvées!</p>
          <p style={{ fontSize: 11, color: '#5C7A4A', marginTop: 8 }}>
            [DEBUG] {realPanels.length} panel(s), {latestPanel.markers.length} marqueurs
          </p>
        </div>
        <ImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          onSuccess={handleImportSuccess}
        />
        <PageHeader
          section="Prises de sang"
          title={<>Prises de <strong style={{ fontWeight: 700 }}>sang</strong></>}
          sub={`${latestPanel.markers.length} marqueurs · dernier : ${new Date(latestPanel.panel.panel_date).toLocaleDateString('fr-FR')}.`}
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
                Importer un CSV
              </button>
            </>
          }
        />

        {/* Hero section */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px', marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Dernier bilan</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 8 }}>
                {new Date(latestPanel.panel.panel_date).toLocaleDateString('fr-FR')}
              </p>
              <p style={{ fontSize: 32, fontWeight: 200, marginBottom: 12 }}>
                {latestPanel.markers.length} marqueurs
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {latestPanel.markers.slice(0, 5).map(m => (
                  <div
                    key={m.id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      backgroundColor: 'var(--color-surface-2)',
                      fontSize: 12,
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{m.marker_code}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, marginLeft: 4 }}>{m.value} {m.unit}</span>
                  </div>
                ))}
                {latestPanel.markers.length > 5 && (
                  <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--color-ink-3)' }}>
                    +{latestPanel.markers.length - 5} autres
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 48, fontWeight: 200, margin: 0 }}>
                  {latestPanel.markers.filter(m => m.status === 'optimal').length}/{latestPanel.markers.length}
                </p>
                <p style={{ fontSize: 12, color: 'var(--color-ink-3)', marginTop: 8 }}>
                  optimal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Markers table */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Tous les marqueurs</div>
          <div>
            {latestPanel.markers.map(marker => (
              <div
                key={marker.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '150px 1fr 120px 100px',
                  gap: 20,
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--color-line)',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{marker.marker_name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', marginTop: 2 }}>
                    {marker.marker_code}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-ink-3)' }}>
                  {marker.ref_min && marker.ref_max && `Ref: ${marker.ref_min} - ${marker.ref_max}`}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500 }}>
                    {marker.value}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-ink-4)', marginTop: 2 }}>
                    {marker.unit}
                  </div>
                </div>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      backgroundColor:
                        marker.status === 'optimal'
                          ? 'var(--color-lichen-soft)'
                          : marker.status === 'warning'
                            ? 'var(--color-amber-soft)'
                            : 'var(--color-rust-soft)',
                      color:
                        marker.status === 'optimal'
                          ? '#5C7A4A'
                          : marker.status === 'warning'
                            ? '#8B5A00'
                            : 'var(--color-rust)',
                    }}
                  >
                    {marker.status || 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
        <CategoryCard key={cat.id} cat={cat} dates={dates} />
      ))}
    </div>
  )
}
