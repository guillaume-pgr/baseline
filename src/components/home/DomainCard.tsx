import Link from 'next/link'
import {
  IconDroplet,
  IconScale,
  IconRun,
  IconMoon,
  IconMicroscope,
} from '@tabler/icons-react'
import { john } from '@/data/seed-john'

type Domain = typeof john.domains[number]
type Color = Domain['color']
type TrendDir = Domain['trend']['dir']

const CIRCUMFERENCE = 2 * Math.PI * 42 // ≈ 263.89

const COLOR_MAP: Record<Color, { stroke: string; track: string; iconBg: string; iconColor: string }> = {
  rust:     { stroke: '#B5705A', track: 'rgba(181,112,90,0.15)',  iconBg: 'var(--color-rust-soft)',     iconColor: 'var(--color-rust)' },
  lichen:   { stroke: '#9CB380', track: 'rgba(156,179,128,0.15)', iconBg: 'var(--color-lichen-soft)',   iconColor: 'var(--color-lichen)' },
  aqua:     { stroke: '#7BA8B5', track: 'rgba(123,168,181,0.15)', iconBg: 'var(--color-aqua-soft)',     iconColor: 'var(--color-aqua)' },
  lavender: { stroke: '#9890B5', track: 'rgba(152,144,181,0.15)', iconBg: 'var(--color-lavender-soft)', iconColor: 'var(--color-lavender)' },
  amber:    { stroke: '#D4A574', track: 'rgba(212,165,116,0.15)', iconBg: 'var(--color-amber-soft)',    iconColor: 'var(--color-amber)' },
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  bloodwork:   IconDroplet,
  composition: IconScale,
  aerobic:     IconRun,
  sleep:       IconMoon,
  microbiome:  IconMicroscope,
}

const TREND_PREFIX: Record<TrendDir, string> = {
  up:   '↗ ',
  flat: '→ ',
}

const TREND_COLOR: Record<TrendDir, string> = {
  up:   'var(--color-lichen)',
  flat: 'var(--color-ink-4)',
}

export default function DomainCard({ domain }: { domain: Domain }) {
  const c = COLOR_MAP[domain.color]
  const Icon = ICON_MAP[domain.id]
  const dashOffset = CIRCUMFERENCE * (1 - domain.score / 100)

  return (
    <Link
      href={domain.href}
      style={{
        backgroundColor: 'var(--color-surface)',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background 0.2s',
      }}
    >
      {/* Header: icon + percentile */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: c.iconBg,
        }}>
          {Icon && <Icon size={16} color={c.iconColor} />}
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.02em',
          color: domain.warn ? 'var(--color-rust)' : 'var(--color-ink-2)',
        }}>
          <strong style={{ fontWeight: 700 }}>{domain.percentile}</strong>ᵉ
        </span>
      </div>

      {/* Mini ring */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
        <svg viewBox="0 0 100 100" style={{ width: 96, height: 96 }}>
          <circle cx="50" cy="50" r="42" fill="none" stroke={c.track} strokeWidth={4} />
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke={c.stroke}
            strokeWidth={4}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 50 50)"
            strokeLinecap="round"
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--color-ink)' }}>
            {domain.score}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--color-ink-4)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
            /100
          </div>
        </div>
      </div>

      {/* Name + sub */}
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 4, letterSpacing: '-0.01em' }}>
        {domain.name}
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-ink-3)', lineHeight: 1.4, marginBottom: 16 }}>
        {domain.sub}
      </div>

      {/* Trend */}
      <div style={{
        marginTop: 'auto',
        paddingTop: 14,
        borderTop: '1px solid var(--color-line)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em', color: 'var(--color-ink-4)', textTransform: 'uppercase' }}>
          {domain.trend.label}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, color: TREND_COLOR[domain.trend.dir] }}>
          {TREND_PREFIX[domain.trend.dir]}{domain.trend.value}
        </span>
      </div>
    </Link>
  )
}
