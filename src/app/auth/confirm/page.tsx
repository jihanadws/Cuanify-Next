'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function EmailConfirmationPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-confirmed'>('loading')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUrlParameters = () => {
      const urlParams = new URLSearchParams(window.location.search)
      return {
        token_hash: urlParams.get('token_hash') || urlParams.get('token'),
        type: urlParams.get('type') || 'email',
        access_token: urlParams.get('access_token'),
        refresh_token: urlParams.get('refresh_token'),
        next: urlParams.get('next') || '/dashboard'
      }
    }

    const handleSessionSetup = async (access_token: string, refresh_token: string, next: string) => {
      console.log('Using setSession with tokens')
      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token
      })

      if (error) {
        console.error('Session setup error:', error)
        setStatus('error')
        setMessage(error.message || 'Gagal mengatur sesi pengguna.')
      } else if (data.user) {
        setStatus('success')
        setMessage('Email berhasil dikonfirmasi! Anda akan diarahkan ke dashboard.')
        setTimeout(() => router.push(next), 3000)
      } else {
        setStatus('error')
        setMessage('Token tidak valid atau sudah kedaluwarsa.')
      }
    }

    const handleTokenVerification = async (token_hash: string, type: string, next: string) => {
      console.log('Using verifyOtp with token_hash')
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as 'signup' | 'invite' | 'recovery' | 'email_change'
      })

      console.log('Verification result:', { data, error })

      if (error) {
        console.error('Email confirmation error:', error)
        
        if (error.message?.includes('already been confirmed')) {
          setStatus('already-confirmed')
          setMessage('Email Anda sudah dikonfirmasi sebelumnya. Anda akan diarahkan ke dashboard.')
        } else if (error.message?.includes('expired')) {
          setStatus('error')
          setMessage('Link konfirmasi sudah kedaluwarsa. Silakan minta email konfirmasi baru.')
        } else {
          setStatus('error')
          setMessage(error.message || 'Terjadi kesalahan saat mengkonfirmasi email.')
        }
      } else if (data.user) {
        setStatus('success')
        setMessage('Email berhasil dikonfirmasi! Anda akan diarahkan ke dashboard.')
        setTimeout(() => router.push(next), 3000)
      } else {
        setStatus('error')
        setMessage('Token konfirmasi tidak valid.')
      }
    }

    const handleEmailConfirmation = async () => {
      try {
        const params = getUrlParameters()
        
        console.log('Confirmation parameters:', { 
          token_hash: !!params.token_hash, 
          type: params.type, 
          access_token: !!params.access_token,
          refresh_token: !!params.refresh_token,
          next: params.next,
          fullUrl: window.location.href
        })

        // Jika ada access_token dan refresh_token, gunakan setSession
        if (params.access_token && params.refresh_token) {
          await handleSessionSetup(params.access_token, params.refresh_token, params.next)
        }
        // Jika ada token_hash, gunakan verifyOtp
        else if (params.token_hash && params.type) {
          await handleTokenVerification(params.token_hash, params.type, params.next)
        } else {
          setStatus('error')
          setMessage('Link konfirmasi tidak valid. Parameter yang diperlukan tidak ditemukan.')
        }
      } catch (err) {
        console.error('Unexpected error:', err)
        setStatus('error')
        setMessage('Terjadi kesalahan yang tidak terduga. Silakan coba lagi.')
      }
    }

    // Tunggu sampai component ter-mount dan window tersedia
    if (typeof window !== 'undefined') {
      handleEmailConfirmation()
    }
  }, [router, supabase.auth])

  const handleContinue = () => {
    if (status === 'success' || status === 'already-confirmed') {
      router.push('/dashboard')
    } else {
      router.push('/auth/signin')
    }
  }

  const handleResendConfirmation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.email) {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: user.email
        })

        if (error) {
          alert('Gagal mengirim ulang email konfirmasi: ' + error.message)
        } else {
          alert('Email konfirmasi baru telah dikirim!')
        }
      } else {
        alert('Tidak dapat mengirim ulang email. Silakan login terlebih dahulu.')
      }
    } catch (error) {
      console.error('Error resending confirmation:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        )
      case 'success':
      case 'already-confirmed':
        return (
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        )
    }
  }

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Mengkonfirmasi Email...'
      case 'success':
        return 'Email Berhasil Dikonfirmasi!'
      case 'already-confirmed':
        return 'Email Sudah Dikonfirmasi'
      case 'error':
        return 'Konfirmasi Email Gagal'
    }
  }

  const getButtonText = () => {
    if (status === 'success' || status === 'already-confirmed') {
      return 'Lanjut ke Dashboard'
    }
    return 'Kembali ke Login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Cuanify
            </h1>
          </div>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8">
          <div className="text-center space-y-6">
            {/* Icon */}
            {getIcon()}
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-slate-800">
              {getTitle()}
            </h2>
            
            {/* Message */}
            <p className="text-slate-600 leading-relaxed">
              {message}
            </p>
            
            {/* Loading Progress */}
            {status === 'loading' && (
              <div className="space-y-3">
                <div className="text-sm text-slate-500">
                  Memverifikasi token konfirmasi...
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            {status !== 'loading' && (
              <div className="space-y-4 pt-4">
                <button
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {getButtonText()}
                </button>
                
                {status === 'error' && (
                  <button
                    onClick={handleResendConfirmation}
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 font-semibold py-3 px-6 rounded-xl border border-slate-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                  >
                    Kirim Ulang Email Konfirmasi
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-sm text-slate-500">
          <p>
            Butuh bantuan?{' '}
            <button 
              onClick={() => router.push('/auth/signin')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Kembali ke Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}