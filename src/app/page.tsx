'use client'

import { useRouter } from 'next/navigation'
import AuthRedirectHandler from '@/components/AuthRedirectHandler'

export default function HomePage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/auth/signup')
  }

  const handleSignIn = () => {
    router.push('/auth/signin')
  }

  const buttonStylePrimary = {
    display: 'inline-flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem 2rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #059669, #047857)',
    border: 'none',
    borderRadius: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(5, 150, 105, 0.4)',
    minWidth: '180px'
  }

  const buttonStyleSecondary = {
    display: 'inline-flex' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem 2rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#047857',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid #6ee7b7',
    borderRadius: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(110, 231, 183, 0.3)',
    minWidth: '180px'
  }

  return (
    <>
      <AuthRedirectHandler />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 50%, #eff6ff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
    }}>
      {/* Background decorative elements */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-1rem',
          right: '-1rem',
          width: '18rem',
          height: '18rem',
          background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(59, 130, 246, 0.15))',
          borderRadius: '50%',
          filter: 'blur(3rem)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-1rem',
          left: '-1rem',
          width: '18rem',
          height: '18rem',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(52, 211, 153, 0.15))',
          borderRadius: '50%',
          filter: 'blur(3rem)'
        }}></div>
      </div>
      
      <div style={{
        position: 'relative',
        zIndex: 10,
        textAlign: 'center',
        maxWidth: '64rem',
        margin: '0 auto',
        padding: '1.5rem 1rem'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            background: 'linear-gradient(135deg, #059669, #2563eb)',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(5, 150, 105, 0.3)'
          }}>
            <span style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.5rem'
            }}>₿</span>
          </div>
        </div>
        
        {/* Main Title */}
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #047857, #2563eb, #047857)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          marginBottom: '1.5rem',
          lineHeight: '1.1'
        }}>
          Cuanify
        </h1>
        
        {/* Subtitle */}
        <p style={{
          fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
          color: '#374151',
          fontWeight: '500',
          marginBottom: '1rem',
          maxWidth: '42rem',
          margin: '0 auto 1rem auto'
        }}>
          Kelola keuangan personal Anda dengan mudah dan efektif
        </p>
        
        {/* Description */}
        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
          color: '#4b5563',
          marginBottom: '3rem',
          maxWidth: '36rem',
          margin: '0 auto 3rem auto',
          lineHeight: '1.6'
        }}>
          Platform manajemen keuangan modern yang membantu Anda mengatur budget, tracking pengeluaran, dan mencapai tujuan finansial
        </p>
        
        {/* Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '28rem',
          margin: '0 auto 4rem auto'
        }}>
          <button 
            onClick={handleGetStarted}
            style={buttonStylePrimary}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(5, 150, 105, 0.5)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(5, 150, 105, 0.4)'
            }}
          >
            💰 Get Started
          </button>
          
          <button 
            onClick={handleSignIn}
            style={buttonStyleSecondary}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.background = '#ecfdf5'
              e.currentTarget.style.borderColor = '#34d399'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'
              e.currentTarget.style.borderColor = '#6ee7b7'
            }}
          >
            🔐 Sign In
          </button>
        </div>
        
        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          maxWidth: '80rem',
          margin: '0 auto'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '1rem'
          }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)'
            }}>
              <span style={{
                color: 'white',
                fontSize: '1.5rem'
              }}>📊</span>
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>Budget Tracking</h3>
            <p style={{
              fontSize: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>Pantau anggaran dan pengeluaran Anda secara real-time</p>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '1rem'
          }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)'
            }}>
              <span style={{
                color: 'white',
                fontSize: '1.5rem'
              }}>📈</span>
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>Smart Analytics</h3>
            <p style={{
              fontSize: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>Analisis mendalam untuk keputusan finansial yang lebih baik</p>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '1rem'
          }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              borderRadius: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)'
            }}>
              <span style={{
                color: 'white',
                fontSize: '1.5rem'
              }}>🔒</span>
            </div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '0.5rem'
            }}>Secure & Private</h3>
            <p style={{
              fontSize: '1rem',
              color: '#4b5563',
              lineHeight: '1.6'
            }}>Data keuangan Anda aman dengan enkripsi tingkat bank</p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
