'use client'

import { usePersonaContext } from '@/lib/context/PersonaContext'
import PageHeader, { Btn } from '@/components/detail/PageHeader'
import { IconPlugConnected, IconRefresh, IconAlertCircle, IconPlus } from '@tabler/icons-react'

// ─── Active devices ───────────────────────────────────────────────────────────
const ACTIVE = [
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
    name: 'Garmin Forerunner 965',
    type: 'Montre GPS',
    status: 'live' as const,
    lastSync: 'Il y a 45 min',
    metrics: ['VO₂max', 'HRV', 'FC repos', 'Zones cardio', 'Activité'],
    color: 'var(--color-aqua)',
    bg: 'var(--color-aqua-soft)',
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
  {
    name: 'Apple Health',
    type: 'Agrégateur iOS',
    status: 'paused' as const,
    lastSync: 'Il y a 3 jours',
    metrics: ['Pas', 'Escaliers', 'Mindfulness'],
    color: 'var(--color-amber)',
    bg: 'var(--color-amber-soft)',
  },
]

// ─── Available devices ────────────────────────────────────────────────────────
const AVAILABLE = [
  { name: 'Google Fit', type: 'Plateforme Android', action: 'connect' as const },
  { name: 'Fitbit', type: 'Montre & tracker', action: 'connect' as const },
  { name: 'Polar Flow', type: 'Montre GPS sport', action: 'soon' as const },
  { name: 'Whoop 4.0', type: 'Wearable récupération', action: 'soon' as const },
]

// ─── Device card ──────────────────────────────────────────────────────────────
function DeviceCard({ d }: { d: typeof ACTIVE[0] }) {
  const isLive = d.status === 'live'
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '20px 24px' }}>
      {/* Header */}
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
        <span style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em',
          padding: '4px 10px', borderRadius: 999,
          backgroundColor: isLive ? 'var(--color-lichen-soft)' : 'var(--color-amber-soft)',
          color: isLive ? '#5C7A4A' : 'var(--color-amber)',
        }}>
          {isLive
            ? <><span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#5C7A4A' }} />Live</>
            : <><IconAlertCircle size={10} />Pausé</>
          }
        </span>
      </div>

      {/* Metrics */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {d.metrics.map(m => (
          <span key={m} style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.04em',
            padding: '3px 8px', borderRadius: 999,
            backgroundColor: 'rgba(0,0,0,0.04)', color: 'var(--color-ink-3)',
          }}>{m}</span>
        ))}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)' }}>
          {isLive ? <><IconRefresh size={10} style={{ display: 'inline', marginRight: 4 }} /></> : null}
          {d.lastSync}
        </span>
        <button style={{
          fontSize: 11, fontWeight: 500, padding: '5px 12px', borderRadius: 999,
          cursor: 'pointer', border: '1px solid var(--color-line-2)',
          backgroundColor: 'transparent', color: 'var(--color-ink-3)',
        }}>
          {isLive ? 'Configurer' : 'Reconnecter'}
        </button>
      </div>
    </div>
  )
}

// ─── Available device row ─────────────────────────────────────────────────────
function AvailableRow({ d }: { d: typeof AVAILABLE[0] }) {
  const isSoon = d.action === 'soon'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0', borderBottom: '1px solid var(--color-line)',
      opacity: isSoon ? 0.5 : 1,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
        <div style={{ fontSize: 11, color: 'var(--color-ink-4)', marginTop: 2 }}>{d.type}</div>
      </div>
      {isSoon ? (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em', padding: '3px 10px', borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.06)', color: 'var(--color-ink-4)' }}>
          Bientôt
        </span>
      ) : (
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 999,
          cursor: 'pointer', border: '1px solid var(--color-ink)',
          backgroundColor: 'transparent', color: 'var(--color-ink)',
        }}>
          <IconPlus size={12} />
          Connecter
        </button>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ConnectionsPage() {
  const { state } = usePersonaContext()
  const isDemo = state.mode === 'demo'

  return (
    <div style={{ padding: '32px 56px 80px' }}>
      <PageHeader
        section="Appareils connectés"
        title={<>Appareils <strong style={{ fontWeight: 700 }}>connectés</strong></>}
        sub={isDemo
          ? '4 sources actives (mode démo) · synchronisation automatique.'
          : 'Connecte tes appareils pour importer tes données en temps réel.'}
        actions={
          <Btn primary>
            <IconPlus size={14} />
            Ajouter une source
          </Btn>
        }
      />

      {/* Active devices — demo only */}
      {isDemo && (
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 16 }}>
            Sources actives (démo) · {ACTIVE.length} appareils
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {ACTIVE.map(d => <DeviceCard key={d.name} d={d} />)}
          </div>
        </div>
      )}

      {/* Real mode: no connections yet */}
      {!isDemo && (
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '40px 32px', marginBottom: 40, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <IconPlugConnected size={20} color="var(--color-ink-4)" />
          </div>
          <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, color: 'var(--color-ink)' }}>Aucun appareil connecté</p>
          <p style={{ fontSize: 13, color: 'var(--color-ink-3)', lineHeight: 1.6, maxWidth: 340, margin: '0 auto' }}>
            Connecte ta montre, ta balance ou ton anneau pour importer automatiquement tes données.
          </p>
        </div>
      )}

      {/* Available devices */}
      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-line)', borderRadius: 16, padding: '24px 28px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 4 }}>
          Sources disponibles
        </p>
        {AVAILABLE.map(d => <AvailableRow key={d.name} d={d} />)}
      </div>
    </div>
  )
}
