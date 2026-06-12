'use client'

import { useSession } from './SessionContext'
import { ADMIN_EMAIL, type AccountStatus } from '@/lib/config'

export type AccountCapabilities = {
  status: AccountStatus
  isAdmin: boolean
  isApproved: boolean
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

  // Approuvé = statut approved_* OU admin, INDÉPENDAMMENT de approved_at /
  // first_name. C'est la seule source de vérité du gating.
  const isApproved = isAdmin || status === 'approved_free' || status === 'approved_premium'
  const isPending  = !isApproved && status === 'pending'
  const isFree     = !isAdmin && status === 'approved_free'
  const isPremium  = isAdmin  || status === 'approved_premium'
  const isRejected = !isApproved && status === 'rejected'

  return {
    status,
    isAdmin,
    isApproved,
    isPremium,
    isFree,
    isPending,
    isRejected,
    canAddBloodPanel: isApproved,
    canUseChat:       isAdmin || status === 'approved_premium',
    canConnectApps:   isAdmin || status === 'approved_premium',
  }
}
