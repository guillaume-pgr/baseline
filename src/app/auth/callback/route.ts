import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  const supabase = await createClient()

  try {
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    // Get user profile to check if onboarding is needed
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name')
      .eq('user_id', user.id)
      .single() as any

    // Redirect to onboarding if no profile or no first_name
    if (!profile?.first_name) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
}
