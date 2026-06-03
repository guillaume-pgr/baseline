'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import {
  IconLayoutDashboard,
  IconTestPipe,
  IconScale,
  IconRun,
  IconMoon,
  IconMicroscope,
  IconPlugConnected,
  IconDna,
  IconApple,
} from '@tabler/icons-react'
import PersonaSwitcher from './sidebar/PersonaSwitcher'
import { useSession } from '@/lib/context/SessionContext'
import { useAccount } from '@/lib/context/useAccount'
import { usePersonaContext } from '@/lib/context/PersonaContext'
import { IconLock } from '@tabler/icons-react'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>
  soon?: boolean
  gated?: boolean  // locked behind Lyvio+
}

type NavSection = {
  label: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: IconLayoutDashboard },
    ],
  },
  {
    label: 'Signaux',
    items: [
      { href: '/bloodwork',    label: 'Prises de sang',    icon: IconTestPipe },
      { href: '/composition',  label: 'Composition',       icon: IconScale,      gated: true },
      { href: '/aerobic',      label: 'Capacité aérobie',  icon: IconRun,        gated: true },
      { href: '/sleep',        label: 'Sommeil & HRV',     icon: IconMoon,       gated: true },
      { href: '/microbiome',   label: 'Microbiote',        icon: IconMicroscope, gated: true },
    ],
  },
  {
    label: 'Sources',
    items: [
      { href: '/connections',  label: 'Appareils connectés', icon: IconPlugConnected },
      { href: '#',             label: 'Génétique',            icon: IconDna,   soon: true },
      { href: '#',             label: 'Nutrition',            icon: IconApple, soon: true },
    ],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useSession()
  const { isFree } = useAccount()
  const { state } = usePersonaContext()
  const showLocks = isFree && state.mode === 'real'

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/signin')
  }

  return (
    <aside
      className="flex flex-col h-screen shrink-0"
      style={{
        width: 240,
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-line)',
      }}
    >
      {/* Persona Switcher */}
      <div style={{ padding: '14px 14px', borderBottom: '1px solid var(--color-line)' }}>
        <PersonaSwitcher />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4 p-3 flex-1 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p
              className="px-3 mb-1 font-mono text-xs uppercase tracking-widest"
              style={{ color: 'var(--color-ink-4)' }}
            >
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map(({ href, label, icon: Icon, soon, gated }) => {
                const active = pathname === href
                const dimmed = soon === true

                if (dimmed) {
                  return (
                    <div
                      key={label}
                      className="flex items-center justify-between px-3 rounded-lg"
                      style={{ height: 38 }}
                    >
                      <div className="flex items-center gap-3" style={{ color: 'var(--color-ink-5)' }}>
                        <Icon size={17} strokeWidth={1.8} color="var(--color-ink-5)" />
                        <span className="text-sm">{label}</span>
                      </div>
                      <span
                        className="font-mono text-xs px-1.5 py-0.5 rounded"
                        style={{
                          color: 'var(--color-ink-5)',
                          backgroundColor: 'var(--color-surface-2)',
                          fontSize: 10,
                        }}
                      >
                        bientôt
                      </span>
                    </div>
                  )
                }

                const locked = showLocks && gated

                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center justify-between px-3 rounded-lg transition-colors"
                    style={{
                      height: 38,
                      color: active ? 'var(--color-ink)' : locked ? 'var(--color-ink-4)' : 'var(--color-ink-3)',
                      backgroundColor: active ? 'var(--color-surface-2)' : 'transparent',
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} strokeWidth={1.8} />
                      <span className="text-sm">{label}</span>
                    </div>
                    {locked && <IconLock size={12} strokeWidth={2} color="var(--color-ink-5)" />}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-5 pb-5"
        style={{ borderTop: '1px solid var(--color-line)', paddingTop: 14 }}
      >
        {user && (
          <div className="mb-4">
            <p className="font-mono text-[10px] text-ink-4 mb-2" style={{ color: 'var(--color-ink-4)' }}>
              {user.email}
            </p>
            <button
              onClick={handleSignOut}
              className="font-mono text-[10px] text-ink-3 hover:text-ink hover:underline transition"
              style={{
                color: 'var(--color-ink-3)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--color-ink)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--color-ink-3)'
              }}
            >
              Déconnexion
            </button>
          </div>
        )}
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-ink-4)' }}>
          Outil éducatif. Ne remplace pas un avis médical.
        </p>
      </div>
    </aside>
  )
}
