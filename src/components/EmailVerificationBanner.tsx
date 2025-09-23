'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface EmailVerificationBannerProps {
  user: User | null
}

export default function EmailVerificationBanner({ user }: EmailVerificationBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      // Periksa apakah email sudah dikonfirmasi
      const isEmailConfirmed = user.email_confirmed_at !== null
      setIsVisible(!isEmailConfirmed)
    }
  }, [user])

  const handleResendConfirmation = async () => {
    if (!user?.email) return

    setIsResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      })

      if (error) {
        console.error('Error resending confirmation:', error)
        alert('Gagal mengirim ulang email konfirmasi. Silakan coba lagi.')
      } else {
        alert('Email konfirmasi telah dikirim ulang! Silakan periksa inbox Anda.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsResending(false)
    }
  }

  if (!isVisible || !user) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 sm:p-6 mb-6 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <span className="text-amber-600 text-lg">⚠️</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-amber-800 mb-2">
            Email Belum Dikonfirmasi
          </h3>
          
          <div className="space-y-3 text-sm text-amber-700">
            <p>
              <strong>Email Anda ({user.email}) belum dikonfirmasi.</strong>{' '}
              Ini mungkin penyebab Anda tidak bisa melakukan transaksi atau mengakses fitur database.
            </p>
            
            <div className="bg-white/50 rounded-lg p-3 space-y-2">
              <p className="font-medium text-amber-800">Langkah-langkah konfirmasi:</p>
              <ol className="list-decimal list-inside space-y-1 text-amber-700">
                <li>Periksa inbox email Anda (termasuk folder spam/junk)</li>
                <li>Cari email dari Supabase dengan subject konfirmasi</li>
                <li>Klik link konfirmasi di dalam email tersebut</li>
                <li>Refresh halaman ini setelah konfirmasi</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleResendConfirmation}
                disabled={isResending}
                className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mengirim...
                  </>
                ) : (
                  'Kirim Ulang Email Konfirmasi'
                )}
              </button>
              
              <button
                onClick={() => setIsVisible(false)}
                className="inline-flex items-center px-4 py-2 bg-white/80 hover:bg-white text-amber-700 text-sm font-medium rounded-lg border border-amber-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                Tutup Sementara
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}