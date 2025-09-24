'use client'

import { useState } from 'react'

export default function SimpleManagementTestPage() {
  const [activeTab, setActiveTab] = useState<'categories' | 'accounts'>('categories')

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header dengan background merah untuk test */}
        <div className="bg-red-500 text-white p-6 rounded-lg mb-6">
          <h1 className="text-3xl font-bold">TEST MANAGEMENT PAGE</h1>
          <p className="text-red-100">Jika Anda melihat warna merah ini, Tailwind CSS berfungsi!</p>
        </div>

        {/* Tab Navigation dengan warna biru */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              📂 Kategori
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'accounts'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🏦 Akun
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'categories' && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded">
                <h2 className="text-xl font-bold mb-2">Tab Kategori Aktif</h2>
                <p>Ini adalah konten untuk kategori. Jika Anda melihat warna kuning, Tailwind CSS berfungsi dengan baik!</p>
                <button className="bg-purple-500 text-white px-4 py-2 rounded mt-4 hover:bg-purple-600">
                  Button Purple Test
                </button>
              </div>
            )}

            {activeTab === 'accounts' && (
              <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded">
                <h2 className="text-xl font-bold mb-2">Tab Akun Aktif</h2>
                <p>Ini adalah konten untuk akun. Jika Anda melihat warna hijau, Tailwind CSS berfungsi dengan baik!</p>
                <button className="bg-orange-500 text-white px-4 py-2 rounded mt-4 hover:bg-orange-600">
                  Button Orange Test
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Test berbagai warna */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-pink-200 p-4 rounded-lg">
            <h3 className="text-pink-800 font-bold">Pink Card</h3>
            <p className="text-pink-600">Test warna pink</p>
          </div>
          <div className="bg-indigo-200 p-4 rounded-lg">
            <h3 className="text-indigo-800 font-bold">Indigo Card</h3>
            <p className="text-indigo-600">Test warna indigo</p>
          </div>
          <div className="bg-teal-200 p-4 rounded-lg">
            <h3 className="text-teal-800 font-bold">Teal Card</h3>
            <p className="text-teal-600">Test warna teal</p>
          </div>
        </div>
      </div>
    </div>
  )
}