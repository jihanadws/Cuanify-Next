'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ResponsiveLayout from '@/components/ResponsiveLayout'

export default function DatabaseDebugPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const checkDatabaseSchema = async () => {
    setLoading(true)
    setResult('')
    
    try {
      // Check transactions table structure
      const { error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .limit(1)
      
      if (transactionError) {
        setResult(`Transactions table error: ${transactionError.message}\n`)
      } else {
        setResult('✅ Transactions table exists and is accessible.\n')
        
        // Try to check if it has the correct columns
        const { error: columnTest } = await supabase
          .from('transactions')
          .select('category_id, account_id')
          .limit(1)
        
        if (columnTest) {
          setResult(prev => prev + `⚠️ Transactions table missing expected columns: ${columnTest.message}\n`)
        } else {
          setResult(prev => prev + '✅ Transactions table has correct foreign key columns\n')
        }
      }

      // Check categories table
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, type, is_default, user_id')
        .limit(5)
      
      if (categoriesError) {
        setResult(prev => prev + `\n❌ Categories table error: ${categoriesError.message}\n`)
      } else {
        setResult(prev => prev + `\n✅ Categories table check:\nFound ${categoriesData.length} categories:\n`)
        categoriesData.forEach((cat: any) => {
          const ownership = cat.is_default ? 'default' : 'user-specific'
          setResult(prev => prev + `  - ${cat.name} (${cat.type}, ${ownership})\n`)
        })
      }

      // Check users table
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, name')
        .limit(3)
      
      if (usersError) {
        setResult(prev => prev + `\n❌ Users table error: ${usersError.message}\n`)
      } else {
        setResult(prev => prev + `\n✅ Users table: Found ${usersData.length} users\n`)
      }

      // Check accounts table and its structure
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('id, name, type, balance')
        .limit(3)
      
      if (accountsError) {
        setResult(prev => prev + `\n❌ Accounts table error: ${accountsError.message}\n`)
      } else {
        setResult(prev => prev + `\n✅ Accounts table: Found ${accountsData.length} accounts\n`)
        
        // Test for currency column
        const { error: currencyError } = await supabase
          .from('accounts')
          .select('currency')
          .limit(1)
        
        if (currencyError) {
          setResult(prev => prev + `⚠️ Accounts table missing 'currency' column\n`)
        } else {
          setResult(prev => prev + `✅ Accounts table has currency column\n`)
        }
      }

    } catch (error) {
      setResult(`Unexpected error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const setupDatabase = async () => {
    setLoading(true)
    setResult('Setting up database...\n')
    
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        setResult(prev => prev + 'Error: User not authenticated\n')
        return
      }

      // 1. Create users table if not exists and insert current user
      const { error: usersError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      const usersMessage = usersError ? `Error - ${usersError.message}` : 'Success'
      setResult(prev => prev + `Users table: ${usersMessage}\n`)

      // 2. Create default categories (try both ways for RLS compatibility)
      const defaultCategories = [
        { name: 'Makanan & Minuman', type: 'EXPENSE', color: '#ef4444', icon: '🍔' },
        { name: 'Transportasi', type: 'EXPENSE', color: '#f97316', icon: '🚗' },
        { name: 'Belanja', type: 'EXPENSE', color: '#eab308', icon: '🛒' },
        { name: 'Gaji', type: 'INCOME', color: '#22c55e', icon: '💰' },
        { name: 'Bonus', type: 'INCOME', color: '#10b981', icon: '🎁' }
      ]

      for (const category of defaultCategories) {
        // First try as default category (no user_id)
        let { error: categoryError } = await supabase
          .from('categories')
          .upsert({
            ...category,
            is_default: true,
            user_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        // If that fails due to RLS, try as user category
        if (categoryError && categoryError.message?.includes('row-level security')) {
          const { error: userCategoryError } = await supabase
            .from('categories')
            .upsert({
              ...category,
              is_default: false,
              user_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          categoryError = userCategoryError
        }
        
        if (categoryError) {
          setResult(prev => prev + `Category ${category.name}: Error - ${categoryError.message}\n`)
        } else {
          setResult(prev => prev + `Category ${category.name}: Success\n`)
        }
      }

      // 3. Create default account (handle missing columns)
      let { error: accountError } = await supabase
        .from('accounts')
        .upsert({
          user_id: user.id,
          name: 'Kas Utama',
          type: 'CASH',
          balance: 0,
          currency: 'IDR',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      // If currency or is_active columns don't exist, try without them
      if (accountError && (accountError.message?.includes('currency') || accountError.message?.includes('is_active'))) {
        const { error: fallbackAccountError } = await supabase
          .from('accounts')
          .upsert({
            user_id: user.id,
            name: 'Kas Utama',
            type: 'CASH',
            balance: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        accountError = fallbackAccountError
      }

      const accountMessage = accountError ? `Error - ${accountError.message}` : 'Success'
      setResult(prev => prev + `Default account: ${accountMessage}\n`)

      setResult(prev => prev + '\nDatabase setup completed! You can now try creating transactions.\n')

    } catch (error) {
      setResult(prev => prev + `Setup error: ${error}\n`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ResponsiveLayout>
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
          Database Debug & Setup
        </h1>
        
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            onClick={checkDatabaseSchema}
            disabled={loading}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Checking...' : 'Check Database Schema'}
          </button>

          <button
            onClick={setupDatabase}
            disabled={loading}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Setting up...' : 'Setup Database'}
          </button>
        </div>

        {result && (
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem',
            padding: '1.5rem',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            whiteSpace: 'pre-wrap',
            maxHeight: '500px',
            overflow: 'auto'
          }}>
            {result}
          </div>
        )}

        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fef3cd', borderRadius: '0.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#856404' }}>❗ Database Setup Instructions:</h3>
          <ol style={{ margin: 0, paddingLeft: '1.5rem', color: '#856404' }}>
            <li>Click "Check Database Schema" to see current table status</li>
            <li>If you see PGRST204 errors or missing tables:
              <ul style={{ marginTop: '0.5rem' }}>
                <li>Go to your <strong>Supabase Dashboard</strong></li>
                <li>Open <strong>SQL Editor</strong></li>
                <li>Copy and run the SQL from <code>/sql/fix_schema.sql</code></li>
              </ul>
            </li>
            <li>After running SQL, click "Setup Database" to add default data</li>
            <li>Test by going to <a href="/transactions/add" style={{ color: '#0066cc' }}>Add Transaction</a></li>
          </ol>
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#d1ecf1', borderRadius: '0.375rem', border: '1px solid #bee5eb' }}>
            <strong>📂 SQL File Location:</strong> <code>C:\Users\jihan\Cuanify-Next\sql\fix_schema.sql</code>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  )
}