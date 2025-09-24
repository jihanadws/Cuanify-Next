'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ResponsiveLayout from '@/components/ResponsiveLayout'
import { type Category } from '@/lib/categories'

interface Transaction {
  id: string
  amount: number
  description: string
  type: 'INCOME' | 'EXPENSE'
  category_id: string
  account: string
  date: string
  created_at: string
  user_id: string
  categories?: Category
}

export default function TransactionsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'INCOME' | 'EXPENSE'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const supabase = createClient()

  const fetchTransactions = useCallback(async () => {
    try {
      setError(null) // Clear previous errors
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      // Ensure user exists in database
      await ensureUserExists(user)

      // First try to fetch with category relation
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          categories (
            id,
            name,
            icon,
            color,
            type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // If relation query fails, try simple query
      if (error) {
        console.warn('Failed to fetch transactions with categories, trying simple query:', error)
        
        const simpleQuery = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (simpleQuery.error) {
          console.error('Error fetching transactions:', simpleQuery.error)
          setError('Gagal memuat data transaksi')
        } else {
          // Fetch categories separately if needed
          const { data: categoriesData } = await supabase
            .from('categories')
            .select('*')
          
          // Map categories to transactions and normalize data
          const transactionsWithCategories = (simpleQuery.data || []).map((transaction: { 
            id: string; 
            amount: number; 
            description: string; 
            type?: string; 
            category_id?: string; 
            created_at: string 
          }) => ({
            ...transaction,
            // Normalize transaction type to uppercase for consistency
            type: transaction.type?.toUpperCase() || 'EXPENSE',
            categories: categoriesData?.find((cat: { id: string; name: string; icon: string; color: string }) => cat.id === transaction.category_id) || null
          }))
          
          setTransactions(transactionsWithCategories)
        }
      } else {
        // Normalize transaction types from main query too
        const normalizedData = (data || []).map((transaction: { 
          id: string; 
          amount: number; 
          description: string; 
          type?: string; 
          categories: unknown; 
          created_at: string 
        }) => ({
          ...transaction,
          type: transaction.type?.toUpperCase() || 'EXPENSE'
        }))
        setTransactions(normalizedData)
      }
    } catch (error) {
      console.error('Unexpected error fetching transactions:', error)
      setError('Terjadi kesalahan saat memuat data transaksi')
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  // Utility function to ensure user exists
  const ensureUserExists = async (user: { id: string; email?: string; user_metadata?: { name?: string } }) => {
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingUser) {
        const { error } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (error) {
          console.error('Error creating user:', error)
        }
      }
    } catch (error) {
      console.error('Error checking/creating user:', error)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const deleteTransaction = async (id: string) => {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting transaction:', error)
        alert('Gagal menghapus transaksi')
      } else {
        setTransactions(transactions.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal menghapus transaksi')
    }
  }

  const getFilteredTransactions = () => {
    let filtered = transactions

    if (filter !== 'all') {
      // Handle both uppercase and lowercase transaction types
      const filterUpper = filter.toUpperCase()
      const filterLower = filter.toLowerCase()
      filtered = filtered.filter(t => 
        t.type === filterUpper || 
        t.type === filterLower ||
        t.type?.toUpperCase() === filterUpper
      )
    }

    if (searchTerm) {
      filtered = filtered.filter(t => 
        (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.categories?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
      }
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <ResponsiveLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh'
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
        </div>
      </ResponsiveLayout>
    )
  }

  if (error) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-full p-2 mr-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-red-800">Error</h3>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null)
                setLoading(true)
                fetchTransactions()
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </ResponsiveLayout>
    )
  }

  const filteredTransactions = getFilteredTransactions()

  return (
    <ResponsiveLayout>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{
        padding: '2rem',
        minHeight: '100vh',
        backgroundColor: '#f8fafc'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#1e293b',
              margin: 0,
              marginBottom: '0.5rem'
            }}>
              Transaksi
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#64748b',
              margin: 0
            }}>
              Kelola dan pantau semua transaksi Anda
            </p>
          </div>
          <button
            onClick={() => router.push('/transactions/add')}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
          >
            <span style={{
              fontSize: '1.2rem',
              lineHeight: 1
            }}>
              +
            </span>
            {' '}
            Tambah Transaksi
          </button>
        </div>

        {/* Filters and Search */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="date">Urutkan: Tanggal</option>
                <option value="amount">Urutkan: Jumlah</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="desc">Terbaru</option>
                <option value="asc">Terlama</option>
              </select>
            </div>
          </div>

          {/* Filter Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {[
              { key: 'all', label: 'Semua' },
              { key: 'INCOME', label: 'Pemasukan' },
              { key: 'EXPENSE', label: 'Pengeluaran' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as 'all' | 'INCOME' | 'EXPENSE')}
                style={{
                  padding: '0.5rem 1rem',
                  border: filter === key ? 'none' : '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  backgroundColor: filter === key ? '#3b82f6' : 'white',
                  color: filter === key ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {/* Total Income */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #10b981'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '0.5rem'
            }}>
              Total Pemasukan
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#10b981'
            }}>
              {formatCurrency(
                transactions
                  .filter(t => t.type?.toUpperCase() === 'INCOME')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
          </div>

          {/* Total Expense */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #ef4444'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '0.5rem'
            }}>
              Total Pengeluaran
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#ef4444'
            }}>
              {formatCurrency(
                transactions
                  .filter(t => t.type?.toUpperCase() === 'EXPENSE')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
          </div>

          {/* Net Balance */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            borderLeft: '4px solid #3b82f6'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '0.5rem'
            }}>
              Saldo Bersih
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#3b82f6'
            }}>
              {formatCurrency(
                transactions
                  .filter(t => t.type?.toUpperCase() === 'INCOME')
                  .reduce((sum, t) => sum + t.amount, 0) -
                transactions
                  .filter(t => t.type?.toUpperCase() === 'EXPENSE')
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#1f2937',
              margin: 0
            }}>
              Daftar Transaksi ({filteredTransactions.length})
            </h2>
          </div>

          {filteredTransactions.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>📝</div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '0.5rem'
              }}>
                {(() => {
                  if (filter === 'all') return 'Belum ada transaksi'
                  if (filter === 'INCOME') return 'Belum ada transaksi pemasukan'
                  return 'Belum ada transaksi pengeluaran'
                })()}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#9ca3af'
              }}>
                Tambahkan transaksi pertama Anda
              </div>
            </div>
          ) : (
            <ul style={{ 
              maxHeight: '60vh', 
              overflowY: 'auto',
              listStyle: 'none',
              padding: 0,
              margin: 0
            }}>
              {filteredTransactions.map((transaction, index) => (
                <li
                  key={transaction.id}
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: index < filteredTransactions.length - 1 ? '1px solid #f3f4f6' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      fontSize: '2rem',
                      lineHeight: 1
                    }}>
                      {transaction.categories?.icon || '📄'}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '500',
                        color: '#1f2937',
                        marginBottom: '0.25rem'
                      }}>
                        {transaction.description}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}>
                        {transaction.categories?.name || 'Lainnya'} • {formatDate(transaction.date || transaction.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      color: transaction.type?.toUpperCase() === 'INCOME' ? '#10b981' : '#ef4444'
                    }}>
                      {transaction.type?.toUpperCase() === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteTransaction(transaction.id)
                      }}
                      style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        border: 'none',
                        borderRadius: '0.375rem',
                        padding: '0.5rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#fecaca'
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.backgroundColor = '#fecaca'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2'
                      }}
                      aria-label="Hapus transaksi"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  )
}