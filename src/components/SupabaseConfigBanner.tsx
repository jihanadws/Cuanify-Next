'use client'

import { useState, useEffect } from 'react'

export default function SupabaseConfigBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if Supabase environment variables are missing
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      setShowBanner(true)
    }
  }, [])

  if (!showBanner) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FEF3C7',
      border: '1px solid #F59E0B',
      padding: '12px 16px',
      zIndex: 1000,
      fontSize: '14px',
      textAlign: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <span style={{ color: '#92400E', fontWeight: '500' }}>
          ⚠️ Configuration Required: 
        </span>
        <span style={{ color: '#92400E' }}>
          Supabase environment variables are not set. Authentication will not work.
        </span>
        <button
          onClick={() => setShowBanner(false)}
          style={{
            marginLeft: '12px',
            color: '#92400E',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ×
        </button>
      </div>
    </div>
  )
}