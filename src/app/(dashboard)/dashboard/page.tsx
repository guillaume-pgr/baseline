'use client'

import { usePersonaData, usePersonaContext } from '@/lib/context/PersonaContext'
import { useRealBloodPanels } from '@/lib/context/useRealBloodPanels'
import EmptyState from '@/components/EmptyState'
import CanvasHead from '@/components/home/CanvasHead'
import HeroStatement from '@/components/home/HeroStatement'
import DomainsGrid from '@/components/home/DomainsGrid'
import FocusGrid from '@/components/home/FocusGrid'
import ActivityGrid from '@/components/home/ActivityGrid'
import Link from 'next/link'

export default function DashboardPage() {
  const data = usePersonaData()
  const { switchDemo } = usePersonaContext()
  const { panels, isLoading } = useRealBloodPanels()

  // Demo mode — full data
  if (data) {
    return (
      <div style={{ padding: '32px 56px 80px' }}>
        <CanvasHead syncSources={data.syncSources} />
        <HeroStatement bioAge={data.bioAge} />
        <DomainsGrid domains={data.domains} cohortLabel={data.profile.cohortLabel} />
        <FocusGrid focus={data.focus as any} />
        <ActivityGrid activity={data.activity as any} />
      </div>
    )
  }

  // Real mode — loading
  if (isLoading) {
    return (
      <div style={{ padding: '32px 56px 80px', color: 'var(--color-ink-3)', fontSize: 13 }}>
        Chargement…
      </div>
    )
  }

  // Real mode — has blood data → summary, no "import" prompt
  if (panels.length > 0) {
    const latest   = panels[0]
    const optimal  = latest.markers.filter(m => m.status === 'optimal').length
    const total    = latest.markers.length
    const panelDate = new Date(latest.panel.panel_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

    return (
      <div style={{ padding: '32px 56px 80px' }}>
        {/* Real mode hero */}
        <section style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 16 }}>
            Tableau de bord · Mode réel
          </p>
          <h1 style={{ fontSize: '3rem', fontWeight: 200, letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 20, color: 'var(--color-ink)' }}>
            Tes données sont<br /><strong style={{ fontWeight: 700 }}>importées et prêtes</strong>.
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-ink-3)', lineHeight: 1.6, maxWidth: 480, marginBottom: 32 }}>
            Connecte d'autres sources pour voir ton score d'équilibre biologique complet.
          </p>

          {/* Blood summary card */}
          <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 12, backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 32px', minWidth: 280 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-ink-4)' }}>
              Dernier bilan sanguin · {panelDate}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 48, fontWeight: 200, letterSpacing: '-0.04em', color: 'var(--color-ink)' }}>{optimal}</span>
              <span style={{ fontSize: 20, color: 'var(--color-ink-3)' }}>/ {total}</span>
              <span style={{ fontSize: 13, color: 'var(--color-ink-3)', marginLeft: 4 }}>marqueurs optimaux</span>
            </div>
            <div style={{ height: 6, borderRadius: 999, backgroundColor: 'var(--color-surface-3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round((optimal / total) * 100)}%`, backgroundColor: 'var(--color-lichen)', borderRadius: 999 }} />
            </div>
            <Link href="/bloodwork" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-2)', textDecoration: 'none', letterSpacing: '0.04em' }}>
              Voir le détail →
            </Link>
          </div>
        </section>

        {/* Next steps */}
        <section>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 16 }}>
            Prochaines étapes
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { href: '/connections', title: 'Connecter une montre',   body: `VO₂max, HRV, zones cardio — synchronisation automatique.`, color: 'var(--color-aqua-soft)',    label: 'Aérobie' },
              { href: '/bloodwork',   title: 'Explorer le bilan sang', body: `${total} marqueurs · ${optimal} optimaux.`,                  color: 'var(--color-rust-soft)',    label: 'Sang' },
              { href: '/connections', title: 'Connecter une balance',  body: `Composition corporelle, masse maigre, hydratation.`,          color: 'var(--color-lichen-soft)', label: 'Composition' },
            ].map(c => (
              <Link key={c.title} href={c.href} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 14, padding: '20px 24px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: c.color, marginBottom: 14 }} />
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 6 }}>{c.label}</p>
                  <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 6, color: 'var(--color-ink)' }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-ink-3)', lineHeight: 1.5 }}>{c.body}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    )
  }

  // Real mode — no data at all
  return (
    <div style={{ padding: '32px 56px 80px' }}>
      <EmptyState
        icon="sparkles"
        iconColor="lichen"
        title="Commence ta synthèse personnelle."
        body="Importe ta première prise de sang ou connecte un appareil pour voir ton score d'équilibre s'animer."
        primaryAction={{
          label: 'Importer un bilan',
          icon: 'upload',
          onClick: () => { window.location.href = '/bloodwork' },
        }}
        secondaryAction={{
          label: 'Voir le mode démo',
          onClick: () => switchDemo('john'),
        }}
      />
    </div>
  )
}
