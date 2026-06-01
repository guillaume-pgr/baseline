import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export default async function proxy(request: NextRequest) {
  const response = await updateSession(request)
  const pathname = request.nextUrl.pathname

  console.log('[proxy] pathname:', pathname)

  // Public routes - always allow (including demo mode dashboard access)
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/bloodwork') ||
    pathname.startsWith('/composition') ||
    pathname.startsWith('/aerobic') ||
    pathname.startsWith('/sleep') ||
    pathname.startsWith('/microbiome')

  if (isPublicRoute) {
    console.log('[proxy] public route, allowing')
    return response
  }

  // Get session from cookies
  const supabaseAccessToken = request.cookies.get('sb-access-token')?.value
  const hasSession = !!supabaseAccessToken

  console.log('[proxy] hasSession:', hasSession)

  // No session on protected route - redirect to signin
  if (!hasSession) {
    console.log('[proxy] no session on protected route, redirecting to /auth/signin')
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Check if user has profile (for routes that require it)
  const isOnboardingRoute = pathname === '/onboarding'
  const isProtectedAppRoute = [
    '/dashboard',
    '/bloodwork',
    '/composition',
    '/aerobic',
    '/sleep',
    '/microbiome',
    '/connections',
  ].some(route => pathname.startsWith(route))

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (pathname.startsWith('/auth/') && hasSession) {
    console.log('[proxy] authenticated user on auth route, redirecting to /dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  console.log('[proxy] allowing request')
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
