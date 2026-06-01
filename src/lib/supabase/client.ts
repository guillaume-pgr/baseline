import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.warn('Supabase config missing - demo mode only, no real data available')
    // Return a minimal client that won't crash but won't work for auth
    return createBrowserClient<Database>(url || '', key || '')
  }

  return createBrowserClient<Database>(url, key)
}
