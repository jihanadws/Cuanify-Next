import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create default categories
  const defaultCategories = [
    // Income Categories
    { name: 'Gaji', type: 'INCOME', color: '#22c55e', icon: '💼', isDefault: true },
    { name: 'Bonus', type: 'INCOME', color: '#34d399', icon: '🎁', isDefault: true },
    { name: 'Freelance', type: 'INCOME', color: '#10b981', icon: '💻', isDefault: true },
    { name: 'Investasi', type: 'INCOME', color: '#059669', icon: '📈', isDefault: true },
    { name: 'Lainnya', type: 'INCOME', color: '#047857', icon: '💰', isDefault: true },

    // Expense Categories
    { name: 'Makanan & Minuman', type: 'EXPENSE', color: '#ef4444', icon: '🍔', isDefault: true },
    { name: 'Transportasi', type: 'EXPENSE', color: '#f97316', icon: '🚗', isDefault: true },
    { name: 'Belanja', type: 'EXPENSE', color: '#eab308', icon: '🛍️', isDefault: true },
    { name: 'Tagihan', type: 'EXPENSE', color: '#8b5cf6', icon: '📋', isDefault: true },
    { name: 'Kesehatan', type: 'EXPENSE', color: '#06b6d4', icon: '🏥', isDefault: true },
    { name: 'Pendidikan', type: 'EXPENSE', color: '#3b82f6', icon: '📚', isDefault: true },
    { name: 'Hiburan', type: 'EXPENSE', color: '#ec4899', icon: '🎬', isDefault: true },
    { name: 'Olahraga', type: 'EXPENSE', color: '#84cc16', icon: '⚽', isDefault: true },
    { name: 'Travel', type: 'EXPENSE', color: '#f59e0b', icon: '✈️', isDefault: true },
    { name: 'Lainnya', type: 'EXPENSE', color: '#6b7280', icon: '📦', isDefault: true },
  ]

  for (const category of defaultCategories) {
    const existingCategory = await prisma.category.findFirst({
      where: { name: category.name, isDefault: true }
    })

    if (!existingCategory) {
      await prisma.category.create({
        data: {
          name: category.name,
          type: category.type as any,
          color: category.color,
          icon: category.icon,
          isDefault: category.isDefault,
        },
      })
    }
  }

  console.log('Default categories seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })