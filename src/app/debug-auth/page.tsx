'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DebugInfo {
  currentUrl?: string
  host?: string
  pathname?: string
  search?: string
  urlParams?: Record<string, string>
  timestamp?: string
  envUrl?: string
  supabaseUrl?: string
  currentSession?: {
    user?: string
    expires?: string
  } | null
  sessionError?: string
  signUpError?: string
  signUpCode?: number
  signUpSuccess?: boolean
  signUpData?: unknown
}

export default function DebugAuthPage() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({})
  const [emailSent, setEmailSent] = useState(false)
  const [testEmail, setTestEmail] = useState('')
  const supabase = createClient()

  useEffect(() => {
    // Dapatkan URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const debugData: DebugInfo = {
      currentUrl: window.location.href,
      host: window.location.host,
      pathname: window.location.pathname,
      search: window.location.search,
      urlParams: Object.fromEntries(urlParams.entries()),
      timestamp: new Date().toISOString(),
      envUrl: process.env.NEXT_PUBLIC_SITE_URL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
    }

    // Cek session saat ini
    supabase.auth.getSession().then(({ data: { session }, error }: {
      data: { session: unknown }
      error: unknown
    }) => {
      debugData.currentSession = session ? {
        user: (session as { user?: { email?: string } }).user?.email,
        expires: (session as { expires_at?: number }).expires_at?.toString()
      } : null
      debugData.sessionError = (error as { message?: string })?.message

      setDebugInfo(debugData)
    })
  }, [supabase.auth])

  const sendTestEmail = async () => {
    if (!testEmail) return

    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'temppassword123',
      })

      if (error) {
        setDebugInfo(prev => ({
          ...prev,
          signUpError: error.message,
          signUpCode: error.status
        }))
      } else {
        setEmailSent(true)
        setDebugInfo(prev => ({
          ...prev,
          signUpSuccess: true,
          signUpData: data
        }))
      }
    } catch (err) {
      setDebugInfo(prev => ({
        ...prev,
        signUpError: (err as Error).message
      }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Auth - Email Verification</h1>
        
        {/* URL Debug Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">URL Information</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Current URL:</strong> {debugInfo.currentUrl}</div>
            <div><strong>Host:</strong> {debugInfo.host}</div>
            <div><strong>Pathname:</strong> {debugInfo.pathname}</div>
            <div><strong>Search:</strong> {debugInfo.search || 'None'}</div>
            <div><strong>Env Site URL:</strong> {debugInfo.envUrl}</div>
            <div><strong>Supabase URL:</strong> {debugInfo.supabaseUrl}</div>
          </div>
        </div>

        {/* URL Parameters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">URL Parameters</h2>
          {debugInfo.urlParams && Object.keys(debugInfo.urlParams).length > 0 ? (
            <div className="space-y-2 text-sm">
              {Object.entries(debugInfo.urlParams).map(([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> {String(value)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No URL parameters found</p>
          )}
        </div>

        {/* Session Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Session</h2>
          {debugInfo.currentSession ? (
            <div className="space-y-2 text-sm">
              <div><strong>User:</strong> {debugInfo.currentSession.user}</div>
              <div><strong>Expires:</strong> {debugInfo.currentSession.expires}</div>
            </div>
          ) : (
            <p className="text-gray-500">No active session</p>
          )}
          {debugInfo.sessionError && (
            <p className="text-red-500 mt-2">Error: {debugInfo.sessionError}</p>
          )}
        </div>

        {/* Test Email Verification */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Email Verification</h2>
          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter test email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={sendTestEmail}
              disabled={!testEmail || emailSent}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {emailSent ? 'Email Sent!' : 'Send Test Email'}
            </button>
            
            {emailSent && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">
                  Test email sent! Check your inbox and click the verification link.
                  The link should redirect to: <code>http://localhost:3000/auth/confirm</code>
                </p>
              </div>
            )}

            {debugInfo.signUpError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">Error: {debugInfo.signUpError}</p>
                {debugInfo.signUpCode && <p className="text-sm text-red-600">Code: {debugInfo.signUpCode}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Debug Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Full Debug Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}