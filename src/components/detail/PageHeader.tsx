import Link from 'next/link'
import { IconChevronRight } from '@tabler/icons-react'

type PageHeaderProps = {
  section: string
  title: React.ReactNode
  sub: string
  actions?: React.ReactNode
}

export default function PageHeader({ section, title, sub, actions }: PageHeaderProps) {
  return (
    <div className="pb-6 mb-8 md:pb-7 md:mb-12" style={{ borderBottom: '1px solid var(--color-line)' }}>
      {/* Breadcrumb */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'var(--font-mono)', fontSize: 10,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--color-ink-4)', marginBottom: 24,
      }}>
        <Link href="/dashboard" style={{ color: 'var(--color-ink-3)', textDecoration: 'none' }}>
          Dashboard
        </Link>
        <IconChevronRight size={12} />
        <span>{section}</span>
      </div>

      {/* Title row — stacks on mobile, title + actions side-by-side on ≥md */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:gap-8" style={{ alignItems: 'end' }}>
        <div>
          <h1 className="text-3xl md:text-[2.75rem]" style={{ fontWeight: 300, letterSpacing: '-0.035em', lineHeight: 1.05, marginBottom: 12 }}>
            {title}
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink-3)', maxWidth: 540, lineHeight: 1.6 }}>
            {sub}
          </p>
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export function Btn({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <button style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      fontSize: 13, fontWeight: 500, padding: '9px 16px', borderRadius: 999,
      cursor: 'pointer', transition: 'all 0.15s',
      border: primary ? '1px solid var(--color-ink)' : '1px solid var(--color-line-2)',
      backgroundColor: primary ? 'var(--color-ink)' : 'transparent',
      color: primary ? 'var(--color-bg)' : 'var(--color-ink-2)',
    }}>
      {children}
    </button>
  )
}
