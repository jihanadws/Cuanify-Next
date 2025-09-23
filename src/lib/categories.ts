import { createClient } from '@/lib/supabase/client'

export interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  color: string
  icon: string
  is_default: boolean
  user_id: string | null
}

/**
 * Get all categories available to the user (default + user's custom categories)
 */
export async function getUserCategories(userId: string): Promise<Category[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .or(`user_id.eq.${userId},is_default.eq.true`)
    .order('is_default', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }

  return data || []
}

/**
 * Get categories by type
 */
export async function getCategoriesByType(userId: string, type: 'INCOME' | 'EXPENSE'): Promise<Category[]> {
  const categories = await getUserCategories(userId)
  return categories.filter(cat => cat.type === type)
}

/**
 * Get category by ID
 */
export async function getCategoryById(categoryId: string): Promise<Category | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', categoryId)
    .single()

  if (error) {
    console.error('Error fetching category:', error)
    return null
  }

  return data
}

/**
 * Legacy function for backward compatibility
 * Maps old category names to icons
 */
export function getCategoryIcon(categoryName: string): string {
  const categoryIcons: Record<string, string> = {
    // Default categories
    'makanan': '🍔',
    'transportasi': '🚗',
    'belanja': '🛒',
    'hiburan': '🎬',
    'kesehatan': '🏥',
    'pendidikan': '📚',
    'tagihan': '⚡',
    'gaji': '💰',
    'investasi': '📈',
    'bisnis': '💼',
    'hadiah': '🎁',
    'lainnya': '📦'
  }
  
  return categoryIcons[categoryName.toLowerCase()] || '📦'
}

/**
 * Get default categories for initialization
 */
export function getDefaultCategories(): Omit<Category, 'id' | 'created_at' | 'updated_at' | 'user_id'>[] {
  return [
    // Expense categories
    { name: 'Makanan', type: 'EXPENSE', color: '#f59e0b', icon: '🍔', is_default: true },
    { name: 'Transportasi', type: 'EXPENSE', color: '#3b82f6', icon: '🚗', is_default: true },
    { name: 'Belanja', type: 'EXPENSE', color: '#8b5cf6', icon: '🛒', is_default: true },
    { name: 'Hiburan', type: 'EXPENSE', color: '#ec4899', icon: '🎬', is_default: true },
    { name: 'Kesehatan', type: 'EXPENSE', color: '#10b981', icon: '🏥', is_default: true },
    { name: 'Pendidikan', type: 'EXPENSE', color: '#06b6d4', icon: '📚', is_default: true },
    { name: 'Tagihan', type: 'EXPENSE', color: '#ef4444', icon: '⚡', is_default: true },
    { name: 'Lainnya', type: 'EXPENSE', color: '#6b7280', icon: '📦', is_default: true },
    
    // Income categories  
    { name: 'Gaji', type: 'INCOME', color: '#10b981', icon: '💰', is_default: true },
    { name: 'Investasi', type: 'INCOME', color: '#3b82f6', icon: '📈', is_default: true },
    { name: 'Bisnis', type: 'INCOME', color: '#8b5cf6', icon: '💼', is_default: true },
    { name: 'Hadiah', type: 'INCOME', color: '#ec4899', icon: '🎁', is_default: true },
    { name: 'Lainnya', type: 'INCOME', color: '#6b7280', icon: '📦', is_default: true }
  ]
}