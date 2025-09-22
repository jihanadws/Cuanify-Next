'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Memuat...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat datang, {session.user.name}!
          </h1>
          <p className="text-gray-600">
            Kelola keuangan Anda dengan mudah dan efektif
          </p>
        </div>

        {/* Dashboard content will be implemented here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Saldo</h3>
            <p className="text-2xl font-bold text-green-600">Rp 0</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Pemasukan Bulan Ini</h3>
            <p className="text-2xl font-bold text-blue-600">Rp 0</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Pengeluaran Bulan Ini</h3>
            <p className="text-2xl font-bold text-red-600">Rp 0</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Jumlah Transaksi</h3>
            <p className="text-2xl font-bold text-gray-600">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Transaksi Terbaru
          </h2>
          <div className="text-center text-gray-500 py-8">
            Belum ada transaksi. Mulai dengan menambahkan transaksi pertama Anda!
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}