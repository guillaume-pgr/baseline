'use client'

import { usePersonaData } from '@/lib/context/PersonaContext'
import CanvasHead from '@/components/home/CanvasHead'
import HeroStatement from '@/components/home/HeroStatement'
import DomainsGrid from '@/components/home/DomainsGrid'
import FocusGrid from '@/components/home/FocusGrid'
import ActivityGrid from '@/components/home/ActivityGrid'

export default function DashboardPage() {
  const data = usePersonaData()

  if (!data) {
    return (
      <div style={{ padding: '32px 56px 80px' }}>
        <p style={{ color: 'var(--color-ink-3)', fontSize: 14 }}>
          Aucune donnée disponible. Importe tes données réelles via le panneau de persona.
        </p>
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
