'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthRedirectHandler() {
  const router = useRouter()

  useEffect(() => {
    // Jalankan hanya di client side
    if (typeof window === 'undefined') return

    const handleAuthRedirect = () => {
      const urlParams = new URLSearchParams(window.location.search)
      
      // Cek apakah ada parameter konfirmasi email
      const token_hash = urlParams.get('token_hash')
      const type = urlParams.get('type')
      const access_token = urlParams.get('access_token')
      const refresh_token = urlParams.get('refresh_token')
      
      console.log('Checking URL parameters:', {
        token_hash: !!token_hash,
        type,
        access_token: !!access_token,
        refresh_token: !!refresh_token,
        fullUrl: window.location.href
      })

      // Jika ada token konfirmasi, redirect ke halaman konfirmasi
      if (token_hash && type) {
        console.log('Redirecting to confirmation page with token')
        const confirmUrl = `/auth/confirm?token_hash=${encodeURIComponent(token_hash)}&type=${encodeURIComponent(type)}`
        router.push(confirmUrl)
        return
      }

      // Jika ada access token dari callback, redirect ke callback handler
      if (access_token && refresh_token) {
        console.log('Redirecting to callback handler with tokens')
        const callbackUrl = `/auth/callback?access_token=${encodeURIComponent(access_token)}&refresh_token=${encodeURIComponent(refresh_token)}`
        router.push(callbackUrl)
        return
      }

      // Cek parameter lain yang mungkin ada
      const code = urlParams.get('code')
      if (code) {
        console.log('Found auth code, redirecting to callback')
        router.push(`/auth/callback?code=${encodeURIComponent(code)}`)
      }
    }

    // Jalankan pengecekan
    handleAuthRedirect()
  }, [router])

  return null // Komponen ini tidak render apa-apa
}