'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ResponsiveLayout from '@/components/ResponsiveLayout'
import { handleDatabaseError } from '@/lib/database-utils'
import type { User } from '@supabase/supabase-js'

interface Budget {
  id: string
  category: string
  amount: number
  period: string
  spent: number
  user_id: string
  created_at: string
  start_date: string
  end_date: string
}

interface Transaction {
  amount: number
  category: string
  created_at: string
  type: string
}

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color: string
  icon: string
  is_default: boolean
  user_id: string | null
  created_at: string
  updated_at: string
}

export default function BudgetPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0]
  })
  
  const router = useRouter()
  const supabase = createClient()
  
  const periods = [
    { value: 'weekly', label: 'Mingguan', days: 7 },
    { value: 'monthly', label: 'Bulanan', days: 30 },
    { value: 'yearly', label: 'Tahunan', days: 365 }
  ]

  const fetchBudgets = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        const errorMessage = handleDatabaseError(error, 'fetch budgets')
        setError(errorMessage)
      } else {
        setBudgets(data || [])
        console.log('Budgets fetched successfully:', data?.length || 0, 'records')
      }
    } catch (error) {
      console.error('Unexpected error fetching budgets:', error)
      setError('An unexpected error occurred while fetching budgets')
    }
  }, [supabase])

  const fetchTransactions = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('amount, category, created_at, type')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .order('created_at', { ascending: false })

      if (error) {
        const errorMessage = handleDatabaseError(error, 'fetch transactions')
        setError(errorMessage)
      } else {
        setTransactions(data || [])
        console.log('Transactions fetched successfully:', data?.length || 0, 'records')
      }
    } catch (error) {
      console.error('Unexpected error fetching transactions:', error)
      setError('An unexpected error occurred while fetching transactions')
    }
  }, [supabase])

  const fetchCategories = useCallback(async (userId: string) => {
    try {
      // Get all categories for this user (user-created + active defaults)
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('name', { ascending: true })

      if (error) {
        const errorMessage = handleDatabaseError(error, 'fetch categories')
        setError(errorMessage)
        console.error('Error fetching categories:', error)
      } else {
        setCategories(data || [])
        console.log('Categories fetched successfully:', data?.length || 0, 'records')
        console.log('User categories:', data?.filter((cat: Category) => cat.user_id === userId).length || 0)
        console.log('Default categories:', data?.filter((cat: Category) => cat.is_default && cat.user_id === null).length || 0)
        console.log('Categories data:', data?.map((cat: Category) => ({ 
          name: cat.name, 
          is_default: cat.is_default, 
          user_id: cat.user_id 
        })))
      }
    } catch (error) {
      console.error('Unexpected error fetching categories:', error)
      setError('An unexpected error occurred while fetching categories')
    }
  }, [supabase])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      if (!user) {
        router.push('/auth/login')
      } else {
        fetchBudgets(user.id)
        fetchTransactions(user.id)
        fetchCategories(user.id)
      }
    }

    getUser()
  }, [router, supabase, fetchBudgets, fetchTransactions, fetchCategories])

  // Set default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({
        ...prev,
        category: categories[0].name
      }))
    }
  }, [categories, formData.category])

  const calculateSpent = (budget: Budget) => {
    const startDate = new Date(budget.start_date)
    const endDate = new Date(budget.end_date)
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.created_at)
        return t.category.toLowerCase() === budget.category.toLowerCase() &&
               transactionDate >= startDate &&
               transactionDate <= endDate
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const getEndDate = (startDate: string, period: string) => {
    const start = new Date(startDate)
    const periodData = periods.find(p => p.value === period)
    if (!periodData) return startDate
    
    const end = new Date(start)
    end.setDate(start.getDate() + periodData.days - 1)
    return end.toISOString().split('T')[0]
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (!user) {
        setError('User not authenticated')
        return
      }

      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        setError('Please enter a valid amount')
        return
      }

      const endDate = getEndDate(formData.start_date, formData.period)

      const { error: insertError } = await supabase
        .from('budgets')
        .insert([
          {
            user_id: user.id,
            category: formData.category,
            amount: amount,
            period: formData.period,
            start_date: formData.start_date,
            end_date: endDate,
            spent: 0
          }
        ])

      if (insertError) {
        console.error('Error adding budget:', insertError)
        setError('Failed to create budget')
      } else {
        setSuccess('Budget created successfully!')
        setFormData({
          category: 'makanan',
          amount: '',
          period: 'monthly',
          start_date: new Date().toISOString().split('T')[0]
        })
        setShowAddForm(false)
        if (user) {
          fetchBudgets(user.id)
        }
      }
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred while creating budget')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteBudget = async (id: string) => {
    if (!confirm('Yakin ingin menghapus budget ini?')) return

    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting budget:', error)
        alert('Gagal menghapus budget')
      } else {
        setBudgets(budgets.filter(b => b.id !== id))
        setSuccess('Budget berhasil dihapus')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Gagal menghapus budget')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getProgressPercentage = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '#ef4444'
    if (percentage >= 80) return '#f59e0b'
    if (percentage >= 60) return '#eab308'
    return '#10b981'
  }

  const getCategoryIcon = (categoryName: string) => {
    // Find the category in the categories array to get the correct icon
    const categoryData = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase())
    return categoryData?.icon || '📦'
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
              Budget
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#64748b',
              margin: 0
            }}>
              Kelola dan pantau budget pengeluaran Anda
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
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
            }}>+</span>
            Tambah Budget
          </button>
        </div>

        {/* Alert Messages */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#166534',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {success}
          </div>
        )}

        {/* Add Budget Form */}
        {showAddForm && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#1f2937',
                margin: 0
              }}>
                Tambah Budget Baru
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                {/* Category */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Kategori
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      boxSizing: 'border-box'
                    }}
                    required
                  >
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.is_default ? '🏠 ' : ''}{category.name.charAt(0).toUpperCase() + category.name.slice(1)}{category.is_default ? ' (Default)' : ''}
                        </option>
                      ))
                    ) : (
                      <option value="">Belum ada kategori</option>
                    )}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Jumlah Budget
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>

                {/* Period */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Periode
                  </label>
                  <select
                    name="period"
                    value={formData.period}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: 'white',
                      boxSizing: 'border-box'
                    }}
                    required
                  >
                    {periods.map((period) => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: submitting ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {submitting ? 'Menyimpan...' : 'Simpan Budget'}
              </button>
            </form>
          </div>
        )}

        {/* Budget Summary */}
        {budgets.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
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
                Total Budget
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#3b82f6'
              }}>
                {formatCurrency(budgets.reduce((sum, b) => sum + b.amount, 0))}
              </div>
            </div>

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
                Total Terpakai
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#ef4444'
              }}>
                {formatCurrency(budgets.reduce((sum, b) => sum + calculateSpent(b), 0))}
              </div>
            </div>

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
                Total Sisa
              </div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#10b981'
              }}>
                {formatCurrency(
                  budgets.reduce((sum, b) => sum + b.amount, 0) -
                  budgets.reduce((sum, b) => sum + calculateSpent(b), 0)
                )}
              </div>
            </div>
          </div>
        )}

        {/* Budgets List */}
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
              Daftar Budget ({budgets.length})
            </h2>
          </div>

          {budgets.length === 0 ? (
            <div style={{
              padding: '3rem',
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: '3rem',
                marginBottom: '1rem'
              }}>💰</div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '0.5rem'
              }}>
                Belum ada budget
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#9ca3af'
              }}>
                Tambahkan budget pertama Anda untuk mengelola pengeluaran
              </div>
            </div>
          ) : (
            <div>
              {budgets.map((budget) => {
                const spent = calculateSpent(budget)
                const percentage = getProgressPercentage(spent, budget.amount)
                const progressColor = getProgressColor(percentage)
                
                return (
                  <div
                    key={budget.id}
                    style={{
                      padding: '1.5rem',
                      borderBottom: '1px solid #f3f4f6'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          fontSize: '2rem',
                          lineHeight: 1
                        }}>
                          {getCategoryIcon(budget.category)}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '0.25rem'
                          }}>
                            {budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}
                          </div>
                          <div style={{
                            fontSize: '0.875rem',
                            color: '#6b7280'
                          }}>
                            {periods.find(p => p.value === budget.period)?.label} • 
                            {new Date(budget.start_date).toLocaleDateString('id-ID')} - 
                            {new Date(budget.end_date).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => deleteBudget(budget.id)}
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          borderRadius: '0.375rem',
                          padding: '0.5rem',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <span style={{
                          fontSize: '0.875rem',
                          color: '#6b7280'
                        }}>
                          {formatCurrency(spent)} dari {formatCurrency(budget.amount)}
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: progressColor
                        }}>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '0.5rem',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '0.25rem',
                        overflow: 'hidden'
                      }}>
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: '100%',
                            backgroundColor: progressColor,
                            transition: 'all 0.3s ease'
                          }}
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div style={{
                      fontSize: '0.875rem',
                      color: percentage >= 100 ? '#dc2626' : 
                            percentage >= 80 ? '#f59e0b' : '#10b981',
                      fontWeight: '500'
                    }}>
                      {percentage >= 100 ? 'Budget sudah terlampaui!' :
                       percentage >= 80 ? 'Hampir mencapai batas budget' :
                       `Sisa: ${formatCurrency(budget.amount - spent)}`}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  )
}