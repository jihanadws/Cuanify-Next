'use client'

import { useState } from 'react'

export default function TestManagementPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'accounts'>('categories')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Management Page</h1>
          <p className="text-gray-600">Testing the management page styling without ResponsiveLayout</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 py-4 px-6 text-center font-medium rounded-tl-2xl transition-colors ${
                activeTab === 'categories'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              📂 Kategori
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`flex-1 py-4 px-6 text-center font-medium rounded-tr-2xl transition-colors ${
                activeTab === 'accounts'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              🏦 Akun
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'categories' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Kategori Transaksi</h2>
                    <p className="text-gray-600">Atur kategori untuk pengeluaran dan pemasukan</p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <span>+</span> Tambah Kategori
                  </button>
                </div>

                {/* Sample category cards */}
                <div className="space-y-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                        🍕
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Makanan</h3>
                        <p className="text-sm text-gray-600">EXPENSE</p>
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-800 p-1">🗑️</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accounts' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Akun Keuangan</h2>
                    <p className="text-gray-600">Kelola akun bank, e-wallet, dan lainnya</p>
                  </div>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <span>+</span> Tambah Akun
                  </button>
                </div>

                {/* Sample account cards */}
                <div className="space-y-3">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-xl">
                        🏛️
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Bank Account</h3>
                        <p className="text-sm text-gray-600">Savings</p>
                        <p className="text-sm font-medium text-green-600">Rp 1,500,000</p>
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-800 p-1">🗑️</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}