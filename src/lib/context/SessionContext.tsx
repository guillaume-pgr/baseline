'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Profile = Database['public']['Tables']['profiles']['Row']
type AuthUser = {
  id: string
  email?: string
}

type SessionContextValue = {
  user: AuthUser | null
  profile: Profile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refetchProfile: () => Promise<void>
}

const SessionContext = createContext<SessionContextValue>({
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
  refetchProfile: async () => {},
})

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const userIdRef = useRef<string | null>(null)

  // Toujours relire la ligne profiles fraîche depuis la DB (unique par user_id)
  // → le statut (pending/approved) n'est jamais figé en cache.
  const fetchProfile = useCallback(async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single() as { data: Profile | null }
    setProfile(data ?? null)
  }, [])

  const refetchProfile = useCallback(async () => {
    if (userIdRef.current) await fetchProfile(userIdRef.current)
  }, [fetchProfile])

  useEffect(() => {
    const supabase = createClient()

    // Check current session
    const checkSession = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()

        if (authUser) {
          userIdRef.current = authUser.id
          setUser({ id: authUser.id, email: authUser.email })
          await fetchProfile(authUser.id)
        } else {
          userIdRef.current = null
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes (login/logout) — relit le profil à chaque connexion
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        userIdRef.current = session.user.id
        setUser({ id: session.user.id, email: session.user.email })
        await fetchProfile(session.user.id)
      } else {
        userIdRef.current = null
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [fetchProfile])

  // Relit le profil quand l'onglet reprend le focus : une approbation faite
  // ailleurs (admin) est reflétée sans rechargement complet.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && userIdRef.current) {
        fetchProfile(userIdRef.current)
      }
    }
    window.addEventListener('focus', onVisible)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', onVisible)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [fetchProfile])

  const signOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (err) {
      console.error('[SessionContext] signOut error:', err)
    }
    userIdRef.current = null
    setUser(null)
    setProfile(null)
  }

  return (
    <SessionContext.Provider value={{ user, profile, isLoading, signOut, refetchProfile }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}
