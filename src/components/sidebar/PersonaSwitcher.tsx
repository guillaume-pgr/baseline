'use client'

import { useRef, useEffect, useState } from 'react'
import { IconChevronDown, IconLock } from '@tabler/icons-react'
import { usePersonaContext } from '@/lib/context/PersonaContext'
import { useSession } from '@/lib/context/SessionContext'
import { useAccount } from '@/lib/context/useAccount'

function calcAge(birthDate: string | null): number | null {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export default function PersonaSwitcher() {
  const { state, switchDemo, setReal } = usePersonaContext()
  const { profile } = useSession()
  const { isPending, isAdmin, isFree, isPremium } = useAccount()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    if (open) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open])

  const isRealMode = state.mode === 'real'

  // Resolve display for the closed button
  const realName = profile ? ((profile as any).first_name || 'Mon profil') : 'Mon profil'
  const realAge  = calcAge((profile as any)?.birth_date ?? null)
  const realSex  = (profile as any)?.sex ?? null
  const realSub  = [realSex === 'M' ? 'H' : realSex === 'F' ? 'F' : null, realAge ? `${realAge} ans` : null]
    .filter(Boolean).join(' · ') || 'Mes données'

  const demoNames: Record<string, string> = { john: 'John Doe', jane: 'Jane Doe' }
  const demoSubs:  Record<string, string> = { john: 'H 30 ans', jane: 'F 30 ans' }

  const buttonLabel = isRealMode
    ? realName
    : (demoNames[state.demoId] ?? 'John Doe')
  const buttonSub = isRealMode
    ? realSub
    : (demoSubs[state.demoId] ?? 'H 30 ans')
  const buttonMode = isRealMode ? 'MODE · MES DONNÉES' : 'MODE · DÉMO'

  const canSwitchToReal = isAdmin || isFree || isPremium

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Closed button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', flexDirection: 'column', gap: 0,
          padding: 14,
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-line)',
          borderRadius: 10,
          cursor: 'pointer', width: '100%', textAlign: 'left',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-line-2)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-line)' }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 2 }}>
          {buttonMode}
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
            {buttonLabel}
          </span>
          <IconChevronDown size={14} color="var(--color-ink-4)" strokeWidth={2} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', marginTop: 2 }}>
          {buttonSub}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-line)',
          borderRadius: 10, boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          zIndex: 50, overflow: 'hidden',
        }}>

          {/* Section 1 — Mes données (real mode) */}
          <div style={{ borderBottom: '1px solid var(--color-line)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', padding: '12px 14px 6px' }}>
              MODE · MES DONNÉES
            </div>

            {canSwitchToReal ? (
              /* Approved / admin: real mode button */
              <button
                onClick={() => { setReal(); setOpen(false) }}
                style={{
                  width: '100%', padding: '10px 14px',
                  backgroundColor: isRealMode ? 'var(--color-surface-2)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 13,
                  color: isRealMode ? 'var(--color-ink)' : 'var(--color-ink-3)',
                  fontWeight: isRealMode ? 500 : 400,
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={e => { if (!isRealMode) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-2)' }}
                onMouseLeave={e => { if (!isRealMode) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
              >
                <span style={{
                  width: 12, height: 12, borderRadius: '50%',
                  border: `1.5px solid ${isRealMode ? 'var(--color-ink)' : 'var(--color-ink-3)'}`,
                  backgroundColor: isRealMode ? 'var(--color-ink)' : 'transparent',
                  flexShrink: 0,
                }} />
                {realName}
              </button>
            ) : (
              /* Pending: locked real mode */
              <div style={{
                padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
                opacity: 0.55,
              }}>
                <IconLock size={13} color="var(--color-ink-3)" strokeWidth={2} />
                <div>
                  <div style={{ fontSize: 13, color: 'var(--color-ink-3)' }}>Mode réel</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)', marginTop: 2 }}>
                    Compte en cours de validation
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2 — Démo (projection) */}
          <div style={{ borderBottom: '1px solid var(--color-line)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', padding: '12px 14px 6px' }}>
              MODE · DÉMO (PROJECTION)
            </div>
            {(['john', 'jane'] as const).map(id => {
              const isActive = state.mode === 'demo' && state.demoId === id
              return (
                <button
                  key={id}
                  onClick={() => { switchDemo(id); setOpen(false) }}
                  style={{
                    width: '100%', padding: '10px 14px',
                    backgroundColor: isActive ? 'var(--color-surface-2)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 13,
                    color: isActive ? 'var(--color-ink)' : 'var(--color-ink-3)',
                    fontWeight: isActive ? 500 : 400,
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-2)' }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                >
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%',
                    border: `1.5px solid ${isActive ? 'var(--color-ink)' : 'var(--color-ink-3)'}`,
                    backgroundColor: isActive ? 'var(--color-ink)' : 'transparent',
                    flexShrink: 0,
                  }} />
                  <span>
                    {demoNames[id]}{' '}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)' }}>
                      — {demoSubs[id]}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Admin badge */}
          {isAdmin && (
            <div style={{ padding: '8px 14px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                padding: '3px 8px', borderRadius: 999,
                backgroundColor: 'var(--color-lichen-soft)',
                color: '#3d5c2d',
              }}>
                ADMIN · bypass actif
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
