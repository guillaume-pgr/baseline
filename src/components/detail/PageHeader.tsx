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
    <div style={{ paddingBottom: 28, borderBottom: '1px solid var(--color-line)', marginBottom: 48 }}>
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

      {/* Title row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: 32 }}>
        <div>
          <h1 style={{ fontSize: '2.75rem', fontWeight: 300, letterSpacing: '-0.035em', lineHeight: 1.05, marginBottom: 12 }}>
            {title}
          </h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-ink-3)', maxWidth: 540, lineHeight: 1.6 }}>
            {sub}
          </p>
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: 8 }}>
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
