import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  // Ambil semua parameter yang mungkin dari URL
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const access_token = searchParams.get('access_token')
  const refresh_token = searchParams.get('refresh_token')
  const expires_at = searchParams.get('expires_at')
  const expires_in = searchParams.get('expires_in')
  const token_type = searchParams.get('token_type')
  const code = searchParams.get('code')
  
  console.log('Auth callback parameters:', {
    token_hash: !!token_hash,
    type,
    access_token: !!access_token,
    refresh_token: !!refresh_token,
    expires_at,
    expires_in,
    token_type,
    code: !!code
  })

  const supabase = await createClient()

  try {
    // Jika ada token_hash dan type, redirect ke halaman konfirmasi
    if (token_hash && type) {
      const confirmUrl = new URL('/auth/confirm', request.url)
      confirmUrl.searchParams.set('token_hash', token_hash)
      confirmUrl.searchParams.set('type', type)
      
      return NextResponse.redirect(confirmUrl)
    }

    // Jika ada access_token, handle session dari URL
    if (access_token && refresh_token) {
      console.log('Setting session with tokens')
      
      // Set session dari URL parameters
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token
      })

      if (error) {
        console.error('Error setting session:', error)
        return NextResponse.redirect(new URL('/auth/signin?error=session_error', request.url))
      }

      if (data.user) {
        console.log('User authenticated successfully:', data.user.email)
        // Redirect ke dashboard jika berhasil
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Jika ada authorization code, exchange untuk token
    if (code) {
      console.log('Exchanging code for session')
      
      // Untuk PKCE flow, kita perlu server-side client
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code:', error)
        // Jika PKCE gagal, coba redirect kembali dengan parameter yang ada
        if (error.message?.includes('code verifier')) {
          // Redirect ke halaman konfirmasi manual jika diperlukan
          return NextResponse.redirect(new URL('/auth/signin?error=pkce_required', request.url))
        }
        return NextResponse.redirect(new URL('/auth/signin?error=code_exchange_error', request.url))
      }

      if (data.user) {
        console.log('User authenticated via code exchange:', data.user.email)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(new URL('/auth/signin?error=unexpected_error', request.url))
  }

  // Jika tidak ada parameter yang valid, redirect ke signin
  console.log('No valid auth parameters found, redirecting to signin')
  return NextResponse.redirect(new URL('/auth/signin', request.url))
}