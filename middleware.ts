import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl
  
  // Cek apakah ada parameter konfirmasi email
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const access_token = searchParams.get('access_token')
  const refresh_token = searchParams.get('refresh_token')
  const code = searchParams.get('code')

  console.log('Middleware - URL parameters:', {
    pathname,
    token_hash: !!token_hash,
    type,
    access_token: !!access_token,
    refresh_token: !!refresh_token,
    code: !!code,
    fullUrl: request.url
  })

  // Jika ada token_hash dan type, redirect ke halaman konfirmasi
  if (token_hash && type && pathname !== '/auth/confirm') {
    console.log('Middleware - Redirecting to confirmation page')
    const confirmUrl = new URL('/auth/confirm', request.url)
    confirmUrl.searchParams.set('token_hash', token_hash)
    confirmUrl.searchParams.set('type', type)
    
    return NextResponse.redirect(confirmUrl)
  }

  // Jika ada access_token dan refresh_token, redirect ke callback
  if (access_token && refresh_token && pathname !== '/auth/callback') {
    console.log('Middleware - Redirecting to callback')
    const callbackUrl = new URL('/auth/callback', request.url)
    callbackUrl.searchParams.set('access_token', access_token)
    callbackUrl.searchParams.set('refresh_token', refresh_token)
    
    return NextResponse.redirect(callbackUrl)
  }

  // Jika ada code, redirect ke callback
  if (code && pathname !== '/auth/callback') {
    console.log('Middleware - Redirecting to callback with code')
    const callbackUrl = new URL('/auth/callback', request.url)
    callbackUrl.searchParams.set('code', code)
    
    return NextResponse.redirect(callbackUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}