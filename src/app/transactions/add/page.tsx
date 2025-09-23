'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ResponsiveLayout from '@/components/ResponsiveLayout'
import { handleDatabaseError } from '@/lib/database-utils'
import { getUserCategories, type Category } from '@/lib/categories'
import type { User } from '@supabase/supabase-js'

export default function AddTransactionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  
  const [formData, setFormData] = useState({
    type: 'EXPENSE' as 'EXPENSE' | 'INCOME',
    category_id: '',
    amount: '',
    description: '',
    account: 'cash',
    date: new Date().toISOString().split('T')[0]
  })
  
  const router = useRouter()
  const supabase = createClient()

  const accounts = [
    { value: 'cash', label: 'Kas/Tunai' },
    { value: 'bank_bca', label: 'Bank BCA' },
    { value: 'bank_mandiri', label: 'Bank Mandiri' },
    { value: 'bank_bni', label: 'Bank BNI' },
    { value: 'ewallet_gopay', label: 'GoPay' },
    { value: 'ewallet_ovo', label: 'OVO' },
    { value: 'ewallet_dana', label: 'DANA' }
  ]

  // Fetch categories and set user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      if (!user) {
        router.push('/auth/signin')
      } else {
        // Fetch user categories
        const userCategories = await getUserCategories(user.id)
        setCategories(userCategories)
        
        // Set default category
        const expenseCategories = userCategories.filter(cat => cat.type === 'EXPENSE')
        if (expenseCategories.length > 0) {
          setFormData(prev => ({
            ...prev,
            category_id: expenseCategories[0].id
          }))
        }
      }
    }

    getUser()
  }, [router, supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Reset category when type changes
    if (name === 'type') {
      const filteredCategories = categories.filter(cat => cat.type === value)
      if (filteredCategories.length > 0) {
        setFormData(prev => ({
          ...prev,
          category_id: filteredCategories[0].id
        }))
      }
    }
  }

  // Filter categories based on transaction type
  const filteredCategories = categories.filter(category => 
    category.type === formData.type
  )

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

      const { error: insertError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: formData.type,
            category_id: formData.category_id,
            amount: amount,
            description: formData.description,
            account: formData.account,
            date: formData.date,
            created_at: new Date().toISOString()
          }
        ])

      if (insertError) {
        const errorMessage = handleDatabaseError(insertError, 'add transaction')
        setError(`${errorMessage}. Please check the console for setup instructions.`)
      } else {
        setSuccess('Transaction added successfully!')
        setTimeout(() => {
          router.push('/transactions')
        }, 1500)
      }
    } catch (err) {
      console.error('Unexpected error adding transaction:', err)
      setError('An unexpected error occurred. Please check the console and ensure database tables are created.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (value: string) => {
    const number = parseFloat(value.replace(/[^\d]/g, ''))
    if (isNaN(number)) return ''
    return new Intl.NumberFormat('id-ID').format(number)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '')
    setFormData(prev => ({
      ...prev,
      amount: rawValue
    }))
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
              Tambah Transaksi
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#64748b',
              margin: 0
            }}>
              Catat transaksi pemasukan atau pengeluaran Anda
            </p>
          </div>
          <button
            onClick={() => router.push('/transactions')}
            style={{
              backgroundColor: '#6b7280',
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
            ← Kembali
          </button>
        </div>

        {/* Form */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
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

            <form onSubmit={handleSubmit}>
              {/* Type Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                  <legend style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Jenis Transaksi
                  </legend>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem'
                }}>
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: 'type', value: 'INCOME' } } as React.ChangeEvent<HTMLInputElement>)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: formData.type === 'INCOME' ? '2px solid #10b981' : '1px solid #d1d5db',
                      backgroundColor: formData.type === 'INCOME' ? '#f0fdf4' : 'white',
                      color: formData.type === 'INCOME' ? '#065f46' : '#374151',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    💰 Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: 'type', value: 'EXPENSE' } } as React.ChangeEvent<HTMLInputElement>)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: formData.type === 'EXPENSE' ? '2px solid #ef4444' : '1px solid #d1d5db',
                      backgroundColor: formData.type === 'EXPENSE' ? '#fef2f2' : 'white',
                      color: formData.type === 'EXPENSE' ? '#7f1d1d' : '#374151',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                  >
                    💸 Pengeluaran
                  </button>
                </div>
                </fieldset>
              </div>

              {/* Amount */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="amount"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}
                >
                  Jumlah
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6b7280',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}>
                    Rp
                  </span>
                  <input
                    id="amount"
                    type="text"
                    value={formatCurrency(formData.amount)}
                    onChange={handleAmountChange}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 3rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db'
                    }}
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="category_id"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}
                >
                  Kategori
                </label>
                <select
                  id="category_id"
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db'
                  }}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="description"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}
                >
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Masukkan deskripsi transaksi..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    resize: 'vertical',
                    minHeight: '80px'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db'
                  }}
                  required
                />
              </div>

              {/* Account */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="account"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}
                >
                  Akun
                </label>
                <select
                  id="account"
                  name="account"
                  value={formData.account}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db'
                  }}
                  required
                >
                  {accounts.map((account) => (
                    <option key={account.value} value={account.value}>
                      {account.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div style={{ marginBottom: '2rem' }}>
                <label 
                  htmlFor="date"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}
                >
                  Tanggal
                </label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db'
                  }}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  backgroundColor: submitting ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = '#2563eb'
                  }
                }}
                onMouseOut={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = '#3b82f6'
                  }
                }}
                onFocus={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = '#2563eb'
                  }
                }}
                onBlur={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.backgroundColor = '#3b82f6'
                  }
                }}
              >
                {submitting ? (
                  <>
                    <div style={{
                      width: '1rem',
                      height: '1rem',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Transaksi'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  )
}