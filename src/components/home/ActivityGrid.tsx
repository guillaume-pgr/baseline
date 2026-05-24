import type { PersonaData } from '@/lib/context/PersonaContext'

type Activity = PersonaData['activity'][number]
type Kind = Activity['kind']
type DeltaDir = Activity['deltaDir']

const KIND_COLOR: Record<Kind, string> = {
  blood: 'var(--color-rust)',
  vo2:   'var(--color-aqua)',
  sleep: 'var(--color-lavender)',
}

const DELTA_COLOR: Record<string, string> = {
  up:   'var(--color-lichen)',
  down: 'var(--color-rust)',
  flat: 'var(--color-ink-3)',
}

function ActivityCard({ item }: { item: Activity }) {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      padding: '22px 24px',
      cursor: 'pointer',
    }}>
      {/* Head */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: 'var(--font-mono)', fontSize: 9,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--color-ink-3)',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: KIND_COLOR[item.kind] }} />
          {item.kindLabel}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--color-ink-4)', letterSpacing: '0.04em' }}>
          {item.date}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 8, color: 'var(--color-ink)' }}>
        {item.title}
      </div>

      {/* Value row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--color-ink)' }}>
          {item.value}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)', letterSpacing: '0.04em' }}>
          {item.unit}
        </span>
      </div>

      {/* Delta */}
      <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: DELTA_COLOR[item.deltaDir] }}>
        {item.delta}
      </div>
    </div>
  )
}

export default function ActivityGrid({ activity }: { activity: PersonaData['activity'] }) {
  return (
    <section style={{ marginBottom: 32 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 12 }}>
        Activité récente
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.025em' }}>
          <strong style={{ fontWeight: 700 }}>3 nouvelles</strong> données cette semaine
        </h2>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', letterSpacing: '0.04em', textDecoration: 'underline', cursor: 'pointer' }}>
          tout voir →
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
        backgroundColor: 'var(--color-line)',
        border: '1px solid var(--color-line)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {activity.map((item) => (
          <ActivityCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
