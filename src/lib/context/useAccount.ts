'use client'

import { useSession } from './SessionContext'
import { ADMIN_EMAIL, type AccountStatus } from '@/lib/config'

export type AccountCapabilities = {
  status: AccountStatus
  isAdmin: boolean
  isPremium: boolean
  isFree: boolean
  isPending: boolean
  isRejected: boolean
  canAddBloodPanel: boolean
  canUseChat: boolean
  canConnectApps: boolean
}

export function useAccount(): AccountCapabilities {
  const { user, profile } = useSession()

  const isAdmin = !!(profile as any)?.is_admin || user?.email === ADMIN_EMAIL
  const status = ((profile as any)?.status ?? 'pending') as AccountStatus

  const isPending  = !isAdmin && status === 'pending'
  const isFree     = !isAdmin && status === 'approved_free'
  const isPremium  = isAdmin  || status === 'approved_premium'
  const isRejected = !isAdmin && status === 'rejected'

  return {
    status,
    isAdmin,
    isPremium,
    isFree,
    isPending,
    isRejected,
    canAddBloodPanel: isAdmin || status === 'approved_free' || status === 'approved_premium',
    canUseChat:       isAdmin || status === 'approved_premium',
    canConnectApps:   isAdmin || status === 'approved_premium',
  }
}
