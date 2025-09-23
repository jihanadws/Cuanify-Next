'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { handleDatabaseError } from '@/lib/database-utils'
import type { User } from '@supabase/supabase-js'

interface TestResult {
  exists: boolean
  accessible?: boolean
  error?: string
  data?: Record<string, unknown>
  emailConfirmed?: boolean
  userId?: string
  userEmail?: string
}

interface TestResults {
  [key: string]: TestResult
}

export default function DatabaseTestPage() {
  const [results, setResults] = useState<TestResults>({})
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  const testDatabaseConnection = async () => {
    setLoading(true)
    const testResults: TestResults = {}

    try {
      // Test database tables directly
      console.log('🔍 Testing database tables...')
      
      // Test profiles table
      try {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
        
        testResults.profiles = {
          exists: !profilesError,
          error: profilesError?.message,
          accessible: Array.isArray(profilesData)
        }
      } catch (error) {
        testResults.profiles = { exists: false, error: 'Table check failed' }
      }

      // Test transactions table
      try {
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('id')
          .limit(1)
        
        testResults.transactions = {
          exists: !transactionsError,
          error: transactionsError?.message,
          accessible: Array.isArray(transactionsData)
        }
      } catch (error) {
        testResults.transactions = { exists: false, error: 'Table check failed' }
      }

      // Test accounts table
      try {
        const { data: accountsData, error: accountsError } = await supabase
          .from('accounts')
          .select('id')
          .limit(1)
        
        testResults.accounts = {
          exists: !accountsError,
          error: accountsError?.message,
          accessible: Array.isArray(accountsData)
        }
      } catch (error) {
        testResults.accounts = { exists: false, error: 'Table check failed' }
      }

      // Test budgets table
      try {
        const { data: budgetsData, error: budgetsError } = await supabase
          .from('budgets')
          .select('id')
          .limit(1)
        
        testResults.budgets = {
          exists: !budgetsError,
          error: budgetsError?.message,
          accessible: Array.isArray(budgetsData)
        }
      } catch (error) {
        testResults.budgets = { exists: false, error: 'Table check failed' }
      }

      // Test user data
      if (user) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          testResults.userProfile = {
            exists: !userError,
            data: userData,
            error: userError?.message,
            emailConfirmed: user.email_confirmed_at !== null,
            userId: user.id,
            userEmail: user.email
          }
        } catch (error) {
          testResults.userProfile = { exists: false, error: 'User profile check failed' }
        }
      } else {
        testResults.userProfile = { exists: false, error: 'User not logged in' }
      }

      setResults(testResults)
    } catch (error) {
      handleDatabaseError(error, 'database test')
    } finally {
      setLoading(false)
    }
  }

  const createTestAccount = async () => {
    if (!user) {
      alert('Please login first')
      return
    }

    try {
      const { error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: 'Test Account',
          type: 'bank',
          balance: 100000
        })
        .select()

      if (error) {
        handleDatabaseError(error, 'create test account')
        alert('Failed to create test account')
      } else {
        alert('Test account created successfully!')
        testDatabaseConnection() // Refresh results
      }
    } catch (error) {
      handleDatabaseError(error, 'create test account')
    }
  }

  const createTestTransaction = async () => {
    if (!user) {
      alert('Please login first')
      return
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'income',
          category: 'Salary',
          amount: 50000,
          description: 'Test transaction',
          account: 'Test Account',
          date: new Date().toISOString().split('T')[0]
        })
        .select()

      if (error) {
        handleDatabaseError(error, 'create test transaction')
        alert('Failed to create test transaction')
      } else {
        alert('Test transaction created successfully!')
        testDatabaseConnection() // Refresh results
      }
    } catch (error) {
      handleDatabaseError(error, 'create test transaction')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">Database Test Dashboard</h1>
          
          {/* User Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">User Status</h2>
            {user ? (
              <div>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? '✅ Yes' : '❌ No'}</p>
              </div>
            ) : (
              <p className="text-red-600">❌ Not logged in</p>
            )}
          </div>

          {/* Test Controls */}
          <div className="mb-6 space-y-4">
            <button
              onClick={testDatabaseConnection}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Database Connection'}
            </button>
            
            <div className="space-x-4">
              <button
                onClick={createTestAccount}
                disabled={!user}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Create Test Account
              </button>
              
              <button
                onClick={createTestTransaction}
                disabled={!user}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
              >
                Create Test Transaction
              </button>
            </div>
          </div>

          {/* Results */}
          {Object.keys(results).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-800">Test Results</h2>
              
              {Object.entries(results).map(([table, result]: [string, TestResult]) => (
                <div key={table} className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    {table.charAt(0).toUpperCase() + table.slice(1)} Table
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>Status:</strong> {result.exists ? '✅ Exists' : '❌ Missing'}
                    </div>
                    
                    <div>
                      <strong>Accessible:</strong> {result.accessible ? '✅ Yes' : '❌ No'}
                    </div>
                    
                    {result.error && (
                      <div className="col-span-3">
                        <strong className="text-red-600">Error:</strong> 
                        <code className="text-red-600 bg-red-50 px-2 py-1 rounded ml-2">
                          {result.error}
                        </code>
                      </div>
                    )}
                    
                    {result.data && (
                      <div className="col-span-3">
                        <strong>Data:</strong>
                        <pre className="bg-slate-100 p-2 rounded mt-1 text-xs overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {/* Show additional user info for userProfile */}
                    {table === 'userProfile' && (
                      <>
                        {result.emailConfirmed !== undefined && (
                          <div>
                            <strong>Email Confirmed:</strong> {result.emailConfirmed ? '✅ Yes' : '❌ No'}
                          </div>
                        )}
                        {result.userEmail && (
                          <div className="col-span-3">
                            <strong>Email:</strong> {result.userEmail}
                          </div>
                        )}
                        {result.userId && (
                          <div className="col-span-3">
                            <strong>User ID:</strong> 
                            <code className="bg-slate-100 px-2 py-1 rounded ml-2 text-xs">
                              {result.userId}
                            </code>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}