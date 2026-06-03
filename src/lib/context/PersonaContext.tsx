'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import type { PersonaMode, DemoPersonaId } from '@/types/persona'
import { john } from '@/data/seed-john'
import { jane } from '@/data/seed-jane'
import { bloodCategories as johnBloodCategories, BILAN_DATES } from '@/data/bloodwork-data'
import { bloodCategoriesR as janeBloodCategories, BILAN_DATES_R } from '@/data/bloodwork-jane'
import { useSession } from './SessionContext'
import { createClient } from '@/lib/supabase/client'
import { ADMIN_EMAIL } from '@/lib/config'

// ─── State & context shape ────────────────────────────────────────────────────

type PersonaState = {
  mode: PersonaMode
  demoId: DemoPersonaId
}

const DEFAULT_STATE: PersonaState = { mode: 'demo', demoId: 'john' }
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
  const { user, profile } = useSession()

  // Initialize from session or localStorage — override mode based on account status
  useEffect(() => {
    if (profile) {
      const isAdmin = !!(profile as any).is_admin || user?.email === ADMIN_EMAIL
      const status  = (profile as any).status ?? 'pending'

      let mode: PersonaMode
      if (!isAdmin && status === 'pending') {
        mode = 'demo'                               // pending → always demo
      } else if (isAdmin || status === 'approved_free' || status === 'approved_premium') {
        mode = 'real'                               // approved → default real
      } else {
        mode = (profile.current_mode as PersonaMode) || 'demo'
      }

      const demoId = ((profile.current_demo_id as DemoPersonaId) === 'jane' ? 'jane' : 'john') as DemoPersonaId
      setState({ mode, demoId })
    } else if (!user) {
      // Guest — hydrate from localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as PersonaState
          if (parsed.mode && parsed.demoId) setState(parsed)
        }
      } catch {}
    }
  }, [user, profile])

  // Persist to localStorage for guest mode
  useEffect(() => {
    if (!user) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      } catch {}
    }
  }, [state, user])

  const setMode = (mode: PersonaMode) => setState(prev => ({ ...prev, mode }))

  const switchDemo = async (demoId: DemoPersonaId) => {
    setState({ mode: 'demo', demoId })

    // Update in Supabase if authenticated
    if (user && profile) {
      const supabase = createClient()
      const updateData = { current_mode: 'demo', current_demo_id: demoId }
      await ((supabase.from('profiles') as any).update(updateData).eq('user_id', user.id))
    }
  }

  const setReal = async () => {
    // Guard: pending users cannot switch to real mode
    const isAdmin = !!(profile as any)?.is_admin || user?.email === ADMIN_EMAIL
    const status  = (profile as any)?.status ?? 'pending'
    if (!isAdmin && status === 'pending') return

    setState(prev => ({ ...prev, mode: 'real' }))

    // Update in Supabase if authenticated
    if (user && profile) {
      const supabase = createClient()
      const updateData = { current_mode: 'real' }
      await ((supabase.from('profiles') as any).update(updateData).eq('user_id', user.id))
    }
  }

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
  if (state.demoId === 'jane') {
    return {
      ...jane,
      bloodwork: {
        ...jane.bloodworkHero,
        categories: janeBloodCategories,
        dates: BILAN_DATES_R,
      },
    }
  }
  return {
    ...john,
    bloodwork: {
      ...john.bloodworkHero,
      categories: johnBloodCategories,
      dates: BILAN_DATES,
    },
  }
}

export type PersonaData = NonNullable<ReturnType<typeof usePersonaData>>
