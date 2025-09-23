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
  { name: 'Accounts', path: '/accounts', icon: '🏦', mobileIcon: '🏦' },
  { name: 'Budgets', path: '/budgets', icon: '�', mobileIcon: '�' },
  { name: 'Profile', path: '/profile', icon: '👤', mobileIcon: '👤' }
]

export default function ResponsiveLayout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  
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
      setIsMobile(window.innerWidth < 768) // md breakpoint
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
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #eff6ff 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '2px solid #d1d5db',
            borderTop: '2px solid #059669',
            borderRadius: '50%',
            margin: '0 auto 1rem auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: '500',
            color: '#374151'
          }}>Loading...</div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // For auth pages and homepage, don't show navigation
  if (!user || pathname === '/' || pathname.startsWith('/auth/')) {
    return <>{children}</>
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 40;
        }
        
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 16rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(52, 211, 153, 0.3);
          z-index: 50;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }
        
        .sidebar.open {
          transform: translateX(0);
        }
        
        .sidebar-desktop {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 16rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(52, 211, 153, 0.3);
          z-index: 50;
        }
        
        .main-content {
          margin-left: 0;
          min-height: 100vh;
          padding-bottom: 5rem;
        }
        
        .main-content-desktop {
          margin-left: 16rem;
          min-height: 100vh;
        }
        
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(52, 211, 153, 0.3);
          z-index: 50;
          padding: 0.5rem 0;
        }
        
        .menu-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          margin: 0.25rem 0.5rem;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          color: #374151;
          font-weight: 500;
        }
        
        .menu-item:hover {
          background: rgba(52, 211, 153, 0.1);
          transform: translateX(0.25rem);
        }
        
        .menu-item.active {
          background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(37, 99, 235, 0.1));
          color: #047857;
          font-weight: 600;
        }
        
        .mobile-menu-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 0.5rem;
          margin: 0 0.25rem;
          flex: 1;
          text-decoration: none;
          color: #6b7280;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .mobile-menu-item:hover {
          background: rgba(52, 211, 153, 0.1);
          color: #047857;
        }
        
        .mobile-menu-item.active {
          background: linear-gradient(135deg, rgba(5, 150, 105, 0.1), rgba(37, 99, 235, 0.1));
          color: #047857;
          font-weight: 600;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #eff6ff 100%)'
      }}>
        {/* Sidebar for Desktop Only */}
        {!isMobile && (
          <div className="sidebar-desktop">
            {/* Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid rgba(52, 211, 153, 0.3)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  background: 'linear-gradient(135deg, #059669, #2563eb)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}>₿</span>
                </div>
                <div>
                  <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #047857, #1d4ed8)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    color: 'transparent',
                    margin: 0
                  }}>
                    Cuanify
                  </h1>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280'
                  }}>
                    Financial Manager
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <div style={{
              padding: '1rem',
              flex: 1,
              overflow: 'auto'
            }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#9ca3af',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0 1rem',
                marginBottom: '0.5rem'
              }}>
                Navigation
              </div>
              {menuItems.map((item) => (
                <div
                  key={item.path}
                  className={`menu-item ${pathname === item.path ? 'active' : ''}`}
                  onClick={() => navigateToPage(item.path)}
                >
                  <span style={{
                    fontSize: '1.25rem',
                    marginRight: '0.75rem'
                  }}>
                    {item.icon}
                  </span>
                  {item.name}
                </div>
              ))}
            </div>

            {/* User Info & Sign Out */}
            <div style={{
              padding: '1rem',
              borderTop: '1px solid rgba(52, 211, 153, 0.3)'
            }}>
              <div style={{
                background: 'rgba(52, 211, 153, 0.1)',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '0.5rem'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#047857',
                  marginBottom: '0.25rem'
                }}>
                  Logged in as
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  {user.email}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>🚪</span>
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Simple Header for Mobile */}
        {isMobile && (
          <header style={{
            position: 'sticky',
            top: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(52, 211, 153, 0.3)',
            padding: '1rem',
            zIndex: 30
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <div style={{
                  width: '1.75rem',
                  height: '1.75rem',
                  background: 'linear-gradient(135deg, #059669, #2563eb)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.75rem'
                  }}>₿</span>
                </div>
                <h1 style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #047857, #1d4ed8)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                  margin: 0
                }}>
                  Cuanify
                </h1>
              </div>
            </div>
          </header>
        )}

        {/* Main Content */}
        <main className={isMobile ? 'main-content' : 'main-content-desktop'}>
          {children}
        </main>

        {/* Bottom Navigation for Mobile */}
        {isMobile && (
          <nav className="bottom-nav">
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center'
            }}>
              {menuItems.map((item) => (
                <div
                  key={item.path}
                  className={`mobile-menu-item ${pathname === item.path ? 'active' : ''}`}
                  onClick={() => navigateToPage(item.path)}
                >
                  <span style={{
                    fontSize: '1.5rem',
                    marginBottom: '0.25rem'
                  }}>
                    {item.mobileIcon}
                  </span>
                  <span>{item.name === 'Add Transaction' ? 'Add' : item.name}</span>
                </div>
              ))}
            </div>
          </nav>
        )}
      </div>
    </>
  )
}