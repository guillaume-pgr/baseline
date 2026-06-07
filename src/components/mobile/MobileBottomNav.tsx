'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconHome, IconChartLine, IconMessageCircle, IconUser } from '@tabler/icons-react'

type IconCmp = React.ComponentType<{ size?: number; stroke?: number }>

const TABS: { href: string; label: string; Icon: IconCmp }[] = [
  { href: '/dashboard', label: 'Accueil', Icon: IconHome },
  { href: '/bloodwork', label: 'Données', Icon: IconChartLine },
  { href: '/assistant', label: 'Assistant', Icon: IconMessageCircle },
  { href: '/profil', label: 'Profil', Icon: IconUser },
]

// Fixed bottom navigation — mobile only (replaces the sidebar/companion on <md).
export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-line)',
        display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px',
      }}
    >
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        const color = active ? 'var(--color-ink)' : 'var(--color-ink-4)'
        return (
          <Link
            key={href}
            href={href}
            style={{ flex: 1, textDecoration: 'none', color, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}
          >
            <Icon size={20} stroke={1.8} />
            <span style={{ fontSize: 9 }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
