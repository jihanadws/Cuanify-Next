'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

export default function DebugAuthPage() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const getAuthInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      
      setUser(user)
      setSession(session)
      setLoading(false)
    }

    getAuthInfo()
  }, [supabase])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Auth Debug Info</h1>
      
      <div style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h2>User Info</h2>
        {user ? (
          <div>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Email Confirmed At:</strong> {user.email_confirmed_at || 'Not confirmed'}</p>
            <p><strong>Created At:</strong> {user.created_at}</p>
            <p><strong>Last Sign In:</strong> {user.last_sign_in_at}</p>
            
            <details style={{ marginTop: '1rem' }}>
              <summary>Full User Object</summary>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {JSON.stringify(user, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <p>Not logged in</p>
        )}
      </div>

      <div style={{ backgroundColor: '#f5f5f5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h2>Session Info</h2>
        {session ? (
          <div>
            <p><strong>Access Token:</strong> {session.access_token ? 'Present' : 'Missing'}</p>
            <p><strong>Refresh Token:</strong> {session.refresh_token ? 'Present' : 'Missing'}</p>
            <p><strong>Expires At:</strong> {session.expires_at}</p>
            
            <details style={{ marginTop: '1rem' }}>
              <summary>Full Session Object</summary>
              <pre style={{ fontSize: '12px', overflow: 'auto' }}>
                {JSON.stringify(session, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <p>No active session</p>
        )}
      </div>

      <div style={{ backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '8px' }}>
        <h2>Configuration Help</h2>
        <p>If email is not confirmed, you need to:</p>
        <ol>
          <li>Go to Supabase Dashboard → Settings → General</li>
          <li>Set Site URL to: <code>http://localhost:3002</code></li>
          <li>Add to Redirect URLs: <code>http://localhost:3002/auth/confirm</code></li>
          <li>Go to Authentication → Email Templates</li>
          <li>Update &quot;Confirm signup&quot; template link to: <code>{`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`}</code></li>
        </ol>
      </div>
    </div>
  )
}