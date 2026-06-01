'use client'

import { useRef, useEffect, useState } from 'react'
import { IconChevronDown } from '@tabler/icons-react'
import { usePersonaContext, usePersonaData } from '@/lib/context/PersonaContext'
import ComingSoonModal from '@/components/ComingSoonModal'

export default function PersonaSwitcher() {
  const { state, switchDemo, setReal } = usePersonaContext()
  const data = usePersonaData()
  const [open, setOpen] = useState(false)
  const [comingSoonOpen, setComingSoonOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open])

  const isRealMode = state.mode === 'real'
  const personaName = isRealMode ? 'Mes données' : data?.profile.displayName || 'John D.'
  const personaSub = isRealMode ? 'Aucune donnée pour l\'instant' : `${data?.profile.persona} · ${data?.profile.age} ans · ${data?.profile.sex}`

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <ComingSoonModal open={comingSoonOpen} onClose={() => setComingSoonOpen(false)} />
      {/* Button - closed state */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          padding: '14px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-line)',
          borderRadius: 10,
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'var(--color-line-2)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.borderColor = 'var(--color-line)'
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', marginBottom: 2 }}>
          {isRealMode ? 'MODE · MES DONNÉES' : 'MODE · DÉMO'}
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Manrope, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
            {personaName}
          </span>
          <IconChevronDown size={14} color="var(--color-ink-4)" strokeWidth={2} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink-3)', marginTop: 2 }}>
          {personaSub}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-line)',
            borderRadius: 10,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {/* Section 1: Real mode */}
          <div style={{ borderBottom: '1px solid var(--color-line)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', padding: '12px 14px 6px' }}>
              MODE · MES DONNÉES
            </div>
            <button
              onClick={() => {
                setComingSoonOpen(true)
                setOpen(false)
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                backgroundColor: isRealMode ? 'var(--color-surface-2)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                color: isRealMode ? 'var(--color-ink)' : 'var(--color-ink-3)',
                fontWeight: isRealMode ? 500 : 400,
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => {
                if (!isRealMode) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-2)'
              }}
              onMouseLeave={e => {
                if (!isRealMode) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
              }}
            >
              <span style={{ width: 12, height: 12, borderRadius: '50%', border: `1.5px solid ${isRealMode ? 'var(--color-ink)' : 'var(--color-ink-3)'}`, backgroundColor: isRealMode ? 'var(--color-ink)' : 'transparent', flexShrink: 0 }} />
              Mode réel
            </button>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)', padding: '4px 14px 10px 34px', lineHeight: 1.4 }}>
              Aucune donnée pour l'instant
            </div>
          </div>

          {/* Section 2: Demo mode */}
          <div style={{ borderBottom: '1px solid var(--color-line)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-ink-4)', padding: '12px 14px 6px' }}>
              MODE · DÉMO (PROJECTION)
            </div>
            {(['john', 'jane'] as const).map(id => {
              const isActive = state.mode === 'demo' && state.demoId === id
              const displayName = id === 'john' ? 'John Doe' : 'Jane Doe'
              const displaySub = id === 'john' ? 'H 30 ans' : 'F 30 ans'
              return (
                <button
                  key={id}
                  onClick={() => {
                    switchDemo(id)
                    setOpen(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: isActive ? 'var(--color-surface-2)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 13,
                    color: isActive ? 'var(--color-ink)' : 'var(--color-ink-3)',
                    fontWeight: isActive ? 500 : 400,
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-surface-2)'
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                  }}
                >
                  <span style={{ width: 12, height: 12, borderRadius: '50%', border: `1.5px solid ${isActive ? 'var(--color-ink)' : 'var(--color-ink-3)'}`, backgroundColor: isActive ? 'var(--color-ink)' : 'transparent', flexShrink: 0 }} />
                  <span>
                    {displayName} <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--color-ink-4)' }}>— {displaySub}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {/* Section 3: Import action */}
          <button
            onClick={() => {
              setComingSoonOpen(true)
              setOpen(false)
            }}
            style={{
              width: '100%',
              padding: '12px 14px',
              backgroundColor: 'transparent',
              border: 'none',
              borderTop: '1px solid var(--color-line)',
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--color-ink-2)',
              fontStyle: 'italic',
              textDecoration: 'underline',
              textAlign: 'left',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--color-ink)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = 'var(--color-ink-2)'
            }}
          >
            + Importer mes données réelles
          </button>
        </div>
      )}
    </div>
  )
}
