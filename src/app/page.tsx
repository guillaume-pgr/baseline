import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LandingPage from '@/components/landing/LandingPage'
import MobileLanding from '@/components/landing/mobile/MobileLanding'

export default async function RootPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) redirect('/dashboard')
  } catch {
    // Supabase not configured — show landing
  }
  // CSS-only responsive switch (no JS flash): mobile (<768px) gets the
  // single-column marketing landing; ≥768px keeps the existing desktop split.
  return (
    <>
      <div className="md:hidden">
        <MobileLanding />
      </div>
      <div className="hidden md:block">
        <LandingPage />
      </div>
    </>
  )
}
