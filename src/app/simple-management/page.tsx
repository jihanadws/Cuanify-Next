'use client'

import { useState } from 'react'
import SimpleLayout from '@/components/SimpleLayout'

export default function SimpleManagementPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'accounts'>('categories')

  return (
    <SimpleLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Management dengan SimpleLayout</h1>
          <p className="text-gray-600">Testing styling dengan layout sederhana</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📂 Kategori
              </button>
              <button
                onClick={() => setActiveTab('accounts')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'accounts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🏦 Akun
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'categories' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Kategori Transaksi</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    + Tambah Kategori
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-gray-600">Konten kategori akan ditampilkan di sini</p>
                </div>
              </div>
            )}

            {activeTab === 'accounts' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">Akun Keuangan</h2>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    + Tambah Akun
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-md p-4">
                  <p className="text-gray-600">Konten akun akan ditampilkan di sini</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SimpleLayout>
  )
}