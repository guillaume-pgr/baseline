'use client'

import { usePersonaContext } from '@/lib/context/PersonaContext'
import PageHeader from '@/components/detail/PageHeader'
import { IconPlugConnected, IconRefresh, IconPlus } from '@tabler/icons-react'

// ─── Active devices — demo only (Withings + Oura) ────────────────────────────
const ACTIVE_DEMO = [
  {
    name: 'Withings Body+',
    type: 'Balance connectée',
    status: 'live' as const,
    lastSync: 'Il y a 2 h',
    metrics: ['Poids', 'Masse grasse', 'Masse musculaire', 'Eau corporelle'],
    color: 'var(--color-lichen)',
    bg: 'var(--color-lichen-soft)',
  },
  {
    name: 'Oura Ring Gen3',
    type: 'Anneau santé',
    status: 'live' as const,
    lastSync: 'Ce matin 07h12',
    metrics: ['Sommeil', 'HRV nuit', 'Température', 'Readiness'],
    color: 'var(--color-lavender)',
    bg: 'var(--color-lavender-soft)',
  },
]

// ─── Available connectors (real mode) ────────────────────────────────────────
const AVAILABLE = [
  {
    name: 'Withings',
    type: 'Balance & montre — composition, activité',
    color: 'var(--color-lichen)',
    bg: 'var(--color-lichen-soft)',
    description: 'Poids, masse grasse, masse musculaire, eau, activité quotidienne.',
  },
  {
    name: 'Oura Ring',
    type: 'Anneau connecté — sommeil, HRV, récupération',
    color: 'var(--color-lavender)',
    bg: 'var(--color-lavender-soft)',
    description: `Sommeil profond, REM, HRV nocturne, température, Readiness Score.`,
  },
]

// ─── Device card (demo) ───────────────────────────────────────────────────────
function DeviceCard({ d }: { d: typeof ACTIVE_DEMO[0] }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: d.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconPlugConnected size={16} color={d.color} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</div>
            <div style={{ fontSize: 11, color: 'var(--color-ink-4)', marginTop: 1 }}>{d.type}</div>
          </div>
        </div>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em', padding: '4px 10px', borderRadius: 999, backgroundColor: 'var(--color-lichen-soft)', color: '#5C7A4A' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#5C7A4A' }} />Live
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {d.metrics.map(m => (
          <span key={m} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.04em', padding: '3px 8px', borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.04)', color: 'var(--color-ink-3)' }}>{m}</span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)' }}>
          <IconRefresh size={10} style={{ display: 'inline', marginRight: 4 }} />{d.lastSync}
        </span>
        <button style={{ fontSize: 11, fontWeight: 500, padding: '5px 12px', borderRadius: 999, cursor: 'pointer', border: '1px solid var(--color-line-2)', backgroundColor: 'transparent', color: 'var(--color-ink-3)' }}>
          Configurer
        </button>
      </div>
    </div>
  )
}

// ─── Available connector card (real mode) ────────────────────────────────────
function ConnectorCard({ c, onConnect }: { c: typeof AVAILABLE[0]; onConnect: () => void }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconPlugConnected size={16} color={c.color} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
          <div style={{ fontSize: 11, color: 'var(--color-ink-4)', marginTop: 1 }}>{c.type}</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-ink-3)', lineHeight: 1.55, marginBottom: 16 }}>{c.description}</p>
      <button
        onClick={onConnect}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, padding: '7px 16px', borderRadius: 999, cursor: 'pointer', border: '1px solid var(--color-ink)', backgroundColor: 'transparent', color: 'var(--color-ink)' }}
      >
        <IconPlus size={12} />
        Connecter {c.name}
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConnectionsPage() {
  const { state } = usePersonaContext()
  const isDemo = state.mode === 'demo'

  const handleConnect = (name: string) => {
    // OAuth flows implemented in MODIF 4 (Withings) and MODIF 5 (Oura)
    console.log('TODO: connect', name)
  }

  return (
    <div className="px-[18px] pt-6 pb-24 md:px-14 md:pt-8 md:pb-20">
      <PageHeader
        section="Appareils connectés"
        title={<>Appareils <strong style={{ fontWeight: 700 }}>connectés</strong></>}
        sub={isDemo
          ? '2 sources actives (mode démo) · Withings + Oura.'
          : 'Connecte Withings et Oura pour importer tes données en temps réel.'}
      />

      {/* Demo: active devices */}
      {isDemo && (
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 16 }}>
            Sources actives (démo) · {ACTIVE_DEMO.length} appareils
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {ACTIVE_DEMO.map(d => <DeviceCard key={d.name} d={d} />)}
          </div>
        </div>
      )}

      {/* Real: no connections yet */}
      {!isDemo && (
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '32px', marginBottom: 32, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <IconPlugConnected size={20} color="var(--color-ink-4)" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, color: 'var(--color-ink)' }}>Aucun appareil connecté</p>
          <p style={{ fontSize: 13, color: 'var(--color-ink-3)', lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
            Connecte Withings ou Oura pour synchroniser automatiquement tes données de santé.
          </p>
        </div>
      )}

      {/* Available connectors */}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 16 }}>
        {isDemo ? 'Connecteurs supportés' : 'Connecter un appareil'}
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {AVAILABLE.map(c => (
          <ConnectorCard key={c.name} c={c} onConnect={() => handleConnect(c.name)} />
        ))}
      </div>
    </div>
  )
}
