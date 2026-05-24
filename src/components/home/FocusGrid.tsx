import Link from 'next/link'
import { IconArrowNarrowRight } from '@tabler/icons-react'
import type { PersonaData } from '@/lib/context/PersonaContext'

type FocusItem = PersonaData['focus'][number]

function FocusCard({ item }: { item: FocusItem }) {
  const dark = item.dark
  const bg = dark ? 'var(--color-ink)' : 'var(--color-surface)'
  const border = dark ? 'var(--color-ink)' : 'var(--color-line)'
  const textColor = dark ? 'var(--color-bg)' : 'var(--color-ink)'
  const bodyColor = dark ? 'rgba(250,250,248,0.7)' : 'var(--color-ink-3)'
  const eyebrowColor = dark ? 'rgba(250,250,248,0.5)' : 'var(--color-ink-4)'
  const dotColor = dark ? 'var(--color-aqua)' : 'var(--color-rust)'
  const footBorder = dark ? 'rgba(250,250,248,0.15)' : 'var(--color-line)'
  const tagBg = dark ? 'rgba(250,250,248,0.08)' : 'var(--color-surface-2)'
  const tagColor = dark ? 'rgba(250,250,248,0.6)' : 'var(--color-ink-3)'
  const emColor = dark ? 'var(--color-aqua)' : 'var(--color-rust)'

  return (
    <div style={{
      backgroundColor: bg,
      border: `1px solid ${border}`,
      borderRadius: 16,
      padding: '28px 32px',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer',
    }}>
      {/* Eyebrow */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'var(--font-mono)', fontSize: 9,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: eyebrowColor, marginBottom: 14,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
        {item.eyebrow}
      </div>

      {/* Title with em highlight */}
      <h3 style={{
        fontSize: 26, fontWeight: 300, letterSpacing: '-0.025em',
        lineHeight: 1.15, marginBottom: 12, flex: 1, color: textColor,
      }}>
        {item.titleParts[0]}
        <em style={{ fontStyle: 'normal', color: emColor, fontWeight: 600 }}>
          {item.titleParts[1]}
        </em>
        {item.titleParts[2]}
      </h3>

      {/* Body */}
      <p style={{ fontSize: 13, color: bodyColor, lineHeight: 1.6, marginBottom: 24 }}>
        {item.body}
      </p>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 18, borderTop: `1px solid ${footBorder}`,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {item.tags.map((tag) => (
            <span key={tag} style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.06em',
              padding: '4px 9px', borderRadius: 999,
              color: tagColor, backgroundColor: tagBg,
              textTransform: 'uppercase',
            }}>
              {tag}
            </span>
          ))}
        </div>
        <Link href={item.href} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600, color: textColor,
          textDecoration: 'none',
        }}>
          {item.cta} <IconArrowNarrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

export default function FocusGrid({ focus }: { focus: PersonaData['focus'] }) {
  return (
    <section style={{ marginBottom: 72 }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 12 }}>
        À considérer · cette semaine
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.025em' }}>
          <strong style={{ fontWeight: 700 }}>Deux</strong> sujets pour toi
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16 }}>
        {focus.map((item) => (
          <FocusCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
