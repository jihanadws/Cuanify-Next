'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ResponsiveLayout from '@/components/ResponsiveLayout'
import { handleDatabaseError } from '@/lib/database-utils'
import type { User } from '@supabase/supabase-js'

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

export default function CategoriesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    color: '#3b82f6',
    icon: '💰'
  })
  
  const router = useRouter()
  const supabase = createClient()

  // Available icons
  const availableIcons = [
    '💰', '🍔', '🚗', '🛒', '🎬', '⚡', '🏥', '📚', 
    '🎯', '🏠', '✈️', '💼', '🎵', '👕', '⛽', '📱',
    '🍕', '☕', '🚌', '🎮', '💊', '🎂', '📖', '🏋️',
    '🛍️', '🎪', '🍷', '🚕', '💻', '📺', '🎸', '⚽'
  ]

  // Available colors - all unique
  const availableColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#14b8a6', '#eab308', '#a855f7', '#e11d48', '#0ea5e9',
    '#22c55e', '#f68c2b', '#9333ea', '#db2777', '#0891b2'
  ]

  const fetchCategories = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},is_default.eq.true`)
        .order('is_default', { ascending: false })
        .order('name', { ascending: true })

      if (error) {
        const errorMessage = handleDatabaseError(error, 'fetch categories')
        setError(errorMessage)
      } else {
        setCategories(data || [])
        console.log('Categories fetched successfully:', data?.length || 0, 'records')
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
        router.push('/auth/signin')
      } else {
        // Check if user email is confirmed
        if (!user.email_confirmed_at) {
          setError('Please verify your email address to use all features. Check your inbox for verification link.')
        }
        await fetchCategories(user.id)
      }
    }

    getUser()
  }, [router, supabase, fetchCategories])

  const createUserIfNotExists = async (user: { 
    id: string; 
    email?: string; 
    user_metadata?: { name?: string } 
  }): Promise<boolean> => {
    try {
      // Try to create user record dengan upsert approach
      const { error } = await supabase
        .from('users')
        .upsert([
          {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ], {
          onConflict: 'id',
          ignoreDuplicates: false
        })
        
      if (error) {
        console.log('User creation note:', error.code, error.message)
        // Jika error 42501 (insufficient privilege), ini normal untuk RLS
        return error.code !== '42501'
      }
      
      return true
    } catch (error) {
      console.log('User creation error (non-critical):', error)
      return false
    }
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

      console.log('Current user ID:', user.id)
      
      // Ensure user exists before creating category
      await createUserIfNotExists(user)

      if (!formData.name.trim()) {
        setError('Nama kategori harus diisi')
        return
      }

      // Check for duplicate category name for the same user and type
      const existingCategory = categories.find((cat: Category) => 
        cat.name.toLowerCase() === formData.name.trim().toLowerCase() &&
        cat.type === formData.type &&
        cat.user_id === user.id &&
        (!editingCategory || cat.id !== editingCategory.id)
      )

      if (existingCategory) {
        const typeText = formData.type === 'INCOME' ? 'pemasukan' : 'pengeluaran'
        setError(`Kategori "${formData.name}" sudah ada untuk ${typeText}`)
        return
      }

      if (editingCategory) {
        // Update existing category
        const { error: updateError } = await supabase
          .from('categories')
          .update({
            name: formData.name.trim(),
            type: formData.type,
            color: formData.color,
            icon: formData.icon,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCategory.id)
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Error updating category:', updateError)
          const errorMessage = handleDatabaseError(updateError, 'update category')
          setError(errorMessage)
        } else {
          setSuccess('Kategori berhasil diperbarui!')
          setEditingCategory(null)
          resetForm()
          await fetchCategories(user.id)
        }
      } else {
        // Create new category - simplified approach
        const { error: insertError } = await supabase
          .from('categories')
          .insert([
            {
              name: formData.name.trim(),
              type: formData.type,
              color: formData.color,
              icon: formData.icon,
              is_default: false,
              user_id: user.id
            }
          ])

        if (insertError) {
          console.error('Error adding category:', insertError)
          
          // Handle specific error codes
          if (insertError.code === '23503') {
            setError('Database setup incomplete. Please ensure your email is verified and account is properly set up.')
          } else if (insertError.code === '23505') {
            setError('A category with this name already exists.')
          } else if (insertError.code === '409') {
            setError('Conflict error. Please try again or refresh the page.')
          } else {
            const errorMessage = handleDatabaseError(insertError, 'create category')
            setError(errorMessage)
          }
        } else {
          setSuccess('Kategori berhasil dibuat!')
          resetForm()
          await fetchCategories(user.id)
        }
      }
    } catch (err) {
      console.error('Error:', err)
      setError('An error occurred while saving category')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'EXPENSE',
      color: '#3b82f6',
      icon: '💰'
    })
    setShowAddForm(false)
    setEditingCategory(null)
    setError('')
    setSuccess('')
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon
    })
    setShowAddForm(true)
    setError('')
    setSuccess('')
  }

  const deleteCategory = async (categoryId: string) => {
    if (!user) return

    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting category:', error)
        setError('Gagal menghapus kategori')
      } else {
        setSuccess('Kategori berhasil dihapus!')
        await fetchCategories(user.id)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Terjadi kesalahan saat menghapus kategori')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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
          <div style={{
            fontSize: '1.125rem',
            color: '#6b7280'
          }}>
            Loading...
          </div>
        </div>
      </ResponsiveLayout>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ResponsiveLayout>
      <div style={{
        padding: '1.5rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            Kelola Kategori
          </h1>
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
              gap: '0.5rem'
            }}
          >
            ➕ Tambah Kategori
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#d1fae5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            {success}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            marginBottom: '2rem'
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
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h2>
              <button
                onClick={resetForm}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '0.375rem',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1.25rem'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Category Name */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="category-name" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Nama Kategori
                </label>
                <input
                  id="category-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama kategori..."
                  required
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

              {/* Category Type */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="category-type" style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Jenis Kategori
                </label>
                <select
                  id="category-type"
                  name="type"
                  value={formData.type}
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
                >
                  <option value="EXPENSE">Pengeluaran</option>
                  <option value="INCOME">Pemasukan</option>
                </select>
              </div>

              {/* Icon Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Icon
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(3rem, 1fr))',
                  gap: '0.5rem',
                  maxWidth: '20rem'
                }}>
                  {availableIcons.map((icon, index) => (
                    <button
                      key={`icon-${icon}-${index}`}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      style={{
                        border: formData.icon === icon ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        padding: '0.5rem',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        backgroundColor: formData.icon === icon ? '#eff6ff' : 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        aspectRatio: '1'
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Warna
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(2.5rem, 1fr))',
                  gap: '0.5rem',
                  maxWidth: '20rem'
                }}>
                  {availableColors.map((color, index) => (
                    <button
                      key={`color-${color}-${index}`}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      style={{
                        backgroundColor: color,
                        border: formData.color === color ? '3px solid #1f2937' : '1px solid #e5e7eb',
                        borderRadius: '0.375rem',
                        padding: '0',
                        width: '2.5rem',
                        height: '2.5rem',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Preview
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <span style={{
                    backgroundColor: formData.color,
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '3rem',
                    height: '3rem'
                  }}>
                    {formData.icon}
                  </span>
                  <div>
                    <div style={{
                      fontWeight: '600',
                      color: '#1f2937'
                    }}>
                      {formData.name || 'Nama kategori'}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      {formData.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    padding: '0.75rem 1.5rem',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
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
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {submitting ? 'Menyimpan...' : (editingCategory ? 'Update Kategori' : 'Tambah Kategori')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Categories List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
              Daftar Kategori
            </h2>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {categories.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#6b7280'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>
                  📝
                </div>
                <div style={{
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Belum ada kategori
                </div>
                <div style={{
                  fontSize: '0.875rem'
                }}>
                  Tambahkan kategori pertama Anda
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gap: '1rem'
              }}>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '0.5rem',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <span style={{
                        backgroundColor: category.color,
                        borderRadius: '0.5rem',
                        padding: '0.75rem',
                        fontSize: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '3.5rem',
                        height: '3.5rem'
                      }}>
                        {category.icon}
                      </span>
                      <div>
                        <div style={{
                          fontWeight: '600',
                          color: '#1f2937',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          {category.name}
                          {category.is_default && (
                            <span style={{
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              fontWeight: '500'
                            }}>
                              Default
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#6b7280'
                        }}>
                          {category.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                        </div>
                      </div>
                    </div>
                    
                    {!category.is_default && (
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        <button
                          onClick={() => handleEdit(category)}
                          style={{
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            border: 'none',
                            borderRadius: '0.375rem',
                            padding: '0.5rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '0.375rem',
                            padding: '0.5rem',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  )
}