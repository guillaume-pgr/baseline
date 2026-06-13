import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSession } from './SessionContext'
import type { Database } from '@/lib/supabase/types'

type BloodPanel = Database['public']['Tables']['blood_panels']['Row']
type BloodMarker = Database['public']['Tables']['blood_markers']['Row']

export interface RealBloodPanelData {
  panel: BloodPanel
  markers: BloodMarker[]
}

export function useRealBloodPanels() {
  const { user } = useSession()
  const [panels, setPanels] = useState<RealBloodPanelData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshIndex, setRefreshIndex] = useState(0)

  // Re-fetch from the DB on demand (after an import or a deletion).
  const refetch = () => setRefreshIndex(i => i + 1)

  useEffect(() => {
    if (!user) {
      console.log('[useRealBloodPanels] no user')
      setIsLoading(false)
      return
    }

    const fetchPanels = async () => {
      try {
        const supabase = createClient()
        console.log('[useRealBloodPanels] fetching for user:', user.id)

        // Get user profile — lecture déterministe et tolérante aux doublons
        // (même ligne que l'écriture côté import : la plus ancienne). .single()
        // levait une erreur si ≠ 1 ligne profiles → panels restait vide et
        // l'empty state s'affichait à tort alors que la donnée existe.
        const profileResult = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })
          .limit(1) as any

        console.log('[useRealBloodPanels] profile result:', profileResult)

        const { data: profileRows, error: profileError } = profileResult
        const profile = Array.isArray(profileRows) ? profileRows[0] : profileRows

        if (profileError) {
          console.error('[useRealBloodPanels] profile error:', profileError)
          throw profileError
        }

        console.log('[useRealBloodPanels] profile:', profile)

        if (!profile) {
          console.log('[useRealBloodPanels] no profile found')
          setError('Profil non trouvé')
          setIsLoading(false)
          return
        }

        // Get blood panels
        const panelsResult = await supabase
          .from('blood_panels')
          .select('*')
          .eq('profile_id', profile.id)
          .order('panel_date', { ascending: false }) as any

        console.log('[useRealBloodPanels] panels result:', panelsResult)

        const { data: panelsData, error: panelsError } = panelsResult

        if (panelsError) {
          console.error('[useRealBloodPanels] panels error:', panelsError)
          throw panelsError
        }

        console.log('[useRealBloodPanels] panelsData:', panelsData, 'count:', panelsData?.length)

        // Get markers for each panel
        const panelsWithMarkers: RealBloodPanelData[] = []

        for (const panel of panelsData || []) {
          const { data: markersData, error: markersError } = await supabase
            .from('blood_markers')
            .select('*')
            .eq('panel_id', panel.id)
            .order('marker_code', { ascending: true }) as any

          console.log('[useRealBloodPanels] markers for panel', panel.id, ':', markersData?.length, 'markers')

          if (markersError) throw markersError

          panelsWithMarkers.push({
            panel,
            markers: markersData || [],
          })
        }

        console.log('[useRealBloodPanels] fetched', panelsWithMarkers.length, 'panels')
        setPanels(panelsWithMarkers)
      } catch (err) {
        console.error('[useRealBloodPanels] error:', err)
        setError(err instanceof Error ? err.message : 'Erreur')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPanels()
  }, [user, refreshIndex])

  return { panels, isLoading, error, refetch }
}
