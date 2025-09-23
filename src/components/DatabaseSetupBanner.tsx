'use client'

import { useState, useEffect } from 'react'

interface DatabaseSetupBannerProps {
  show: boolean
}

export default function DatabaseSetupBanner({ show }: DatabaseSetupBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const isDismissed = localStorage.getItem('database-setup-banner-dismissed')
    setDismissed(isDismissed === 'true')
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('database-setup-banner-dismissed', 'true')
  }

  const handleSetupInstructions = () => {
    console.group('🔧 DATABASE SETUP INSTRUCTIONS')
    console.log('')
    console.log('📋 Follow these steps to set up your database:')
    console.log('')
    console.log('1️⃣ Go to your Supabase Dashboard (https://supabase.com)')
    console.log('2️⃣ Navigate to SQL Editor')
    console.log('3️⃣ Copy the entire content from: sql/complete_setup.sql')
    console.log('4️⃣ Paste and RUN the SQL script')
    console.log('')
    console.log('📄 This will create the following tables:')
    console.log('   • profiles - User profile information')
    console.log('   • transactions - Financial transactions')
    console.log('   • accounts - User accounts (bank, wallet, etc.)')
    console.log('   • budgets - Budget management')
    console.log('')
    console.log('🔒 Security features:')
    console.log('   • Row Level Security (RLS) enabled')
    console.log('   • User-specific data access policies')
    console.log('   • Automatic triggers for timestamps')
    console.log('')
    console.groupEnd()
    alert('Database setup instructions logged to console. Please check your browser\'s developer console (F12).')
  }

  if (!show || dismissed) {
    return null
  }

  return (
    <div style={{
      backgroundColor: '#fffbeb',
      border: '1px solid #fbbf24',
      borderRadius: '0.5rem',
      padding: '1rem',
      margin: '1rem 0',
      position: 'relative'
    }}>
      <button
        onClick={handleDismiss}
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          background: 'none',
          border: 'none',
          fontSize: '1.25rem',
          cursor: 'pointer',
          color: '#d97706',
          padding: '0.25rem'
        }}
        title="Dismiss this banner"
      >
        ×
      </button>
      
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <span style={{
          fontSize: '1.5rem',
          flexShrink: 0
        }}>
          ⚠️
        </span>
        
        <div style={{ flex: 1 }}>
          <h4 style={{
            color: '#d97706',
            fontSize: '1rem',
            fontWeight: '600',
            margin: '0 0 0.5rem 0'
          }}>
            Database Setup Required
          </h4>
          
          <p style={{
            color: '#92400e',
            fontSize: '0.875rem',
            margin: '0 0 1rem 0',
            lineHeight: '1.4'
          }}>
            The database tables haven&apos;t been created yet. You need to run the SQL migration script in your Supabase dashboard to use all features.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={handleSetupInstructions}
              style={{
                backgroundColor: '#d97706',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#b45309'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#d97706'
              }}
            >
              📖 Show Setup Instructions
            </button>
            
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: 'transparent',
                color: '#d97706',
                border: '1px solid #d97706',
                borderRadius: '0.375rem',
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d97706'
                e.currentTarget.style.color = 'white'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#d97706'
              }}
            >
              🚀 Open Supabase Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}