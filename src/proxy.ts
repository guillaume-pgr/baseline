import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Public routes — no session check, no updateSession call
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/bloodwork') ||
    pathname.startsWith('/composition') ||
    pathname.startsWith('/aerobic') ||
    pathname.startsWith('/sleep') ||
    pathname.startsWith('/microbiome') ||
    pathname.startsWith('/connections')

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Non-public routes : run session check
  const response = await updateSession(request)
  const supabaseAccessToken = request.cookies.get('sb-access-token')?.value
  const hasSession = !!supabaseAccessToken

  if (!hasSession) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
