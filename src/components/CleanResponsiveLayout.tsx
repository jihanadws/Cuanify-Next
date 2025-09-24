'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface LayoutProps {
  children: React.ReactNode
}

interface MenuItem {
  name: string
  path: string
  icon: string
  mobileIcon: string
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: '🏠', mobileIcon: '🏠' },
  { name: 'Transactions', path: '/transactions', icon: '📊', mobileIcon: '📊' },
  { name: 'Management', path: '/management', icon: '⚙️', mobileIcon: '⚙️' },
  { name: 'Budgets', path: '/budgets', icon: '💰', mobileIcon: '💰' },
  { name: 'Profile', path: '/profile', icon: '👤', mobileIcon: '👤' }
]

export default function CleanResponsiveLayout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      if (!user && pathname !== '/' && !pathname.startsWith('/auth/')) {
        router.push('/auth/signin')
      }
    }

    getUser()
  }, [supabase.auth, router, pathname])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navigateToPage = (path: string) => {
    router.push(path)
    setSidebarOpen(false)
  }

  const getSidebarClass = () => {
    if (!isMobile) return 'translate-x-0'
    return sidebarOpen ? 'translate-x-0' : '-translate-x-full'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading...</div>
        </div>
      </div>
    )
  }

  if (!user || pathname === '/' || pathname.startsWith('/auth/')) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {isMobile && sidebarOpen && (
        <button 
          type="button"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 cursor-default"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${getSidebarClass()}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Cuanify</h1>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                ✕
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigateToPage(item.path)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  pathname === item.path
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-2">
              {user.email}
            </div>
            <button
              onClick={handleSignOut}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`${isMobile ? '' : 'ml-64'} min-h-screen`}>
        {/* Mobile header */}
        {isMobile && (
          <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                ☰
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Cuanify</h1>
              <div></div>
            </div>
          </header>
        )}

        {/* Page content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  )
}