'use client'

import { usePersonaData, usePersonaContext } from '@/lib/context/PersonaContext'
import EmptyState from '@/components/EmptyState'
import CanvasHead from '@/components/home/CanvasHead'
import HeroStatement from '@/components/home/HeroStatement'
import DomainsGrid from '@/components/home/DomainsGrid'
import FocusGrid from '@/components/home/FocusGrid'
import ActivityGrid from '@/components/home/ActivityGrid'
import MobileDashboard from '@/components/mobile/MobileDashboard'

// ─── Desktop dashboard (≥md) — unchanged ─────────────────────────────────────
function DesktopDashboard() {
  const data = usePersonaData()
  const { switchDemo } = usePersonaContext()

  if (!data) {
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

export default function DashboardPage() {
  return (
    <>
      <div className="md:hidden">
        <MobileDashboard />
      </div>
      <div className="hidden md:block">
        <DesktopDashboard />
      </div>
    </>
  )
}
