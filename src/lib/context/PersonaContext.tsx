'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { PersonaMode, DemoPersonaId } from '@/types/persona'
import { guillaume } from '@/data/seed-guillaume'
import { raphaelle } from '@/data/seed-raphaelle'
import { bloodCategories as guillaumeBloodCategories, BILAN_DATES } from '@/data/bloodwork-data'
import { bloodCategoriesR, BILAN_DATES_R } from '@/data/bloodwork-raphaelle'

// ─── State & context shape ────────────────────────────────────────────────────

type PersonaState = {
  mode: PersonaMode
  demoId: DemoPersonaId
}

const DEFAULT_STATE: PersonaState = { mode: 'demo', demoId: 'guillaume' }
const STORAGE_KEY = 'lyvio.persona'

type PersonaContextValue = {
  state: PersonaState
  setMode: (mode: PersonaMode) => void
  switchDemo: (id: DemoPersonaId) => void
  setReal: () => void
}

const PersonaContext = createContext<PersonaContextValue>({
  state: DEFAULT_STATE,
  setMode: () => {},
  switchDemo: () => {},
  setReal: () => {},
})

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersonaState>(DEFAULT_STATE)

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as PersonaState
        if (parsed.mode && parsed.demoId) setState(parsed)
      }
    } catch {}
  }, [])

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  const setMode = (mode: PersonaMode) => setState(prev => ({ ...prev, mode }))
  const switchDemo = (demoId: DemoPersonaId) => setState({ mode: 'demo', demoId })
  const setReal = () => setState(prev => ({ ...prev, mode: 'real' }))

  return (
    <PersonaContext.Provider value={{ state, setMode, switchDemo, setReal }}>
      {children}
    </PersonaContext.Provider>
  )
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function usePersonaContext() {
  return useContext(PersonaContext)
}

// Full persona data — null when in real mode (no data yet)
export function usePersonaData() {
  const { state } = usePersonaContext()
  if (state.mode === 'real') return null
  if (state.demoId === 'raphaelle') {
    return {
      ...raphaelle,
      bloodwork: {
        ...raphaelle.bloodworkHero,
        categories: bloodCategoriesR,
        dates: BILAN_DATES_R,
      },
    }
  }
  return {
    ...guillaume,
    bloodwork: {
      ...guillaume.bloodworkHero,
      categories: guillaumeBloodCategories,
      dates: BILAN_DATES,
    },
  }
}

export type PersonaData = NonNullable<ReturnType<typeof usePersonaData>>
