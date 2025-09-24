# Database Schema Fix Guide

## Problem
The application was encountering PGRST204 errors when trying to add transactions. The error message:
```
"Could not find the 'category_id' column of 'transactions' in the schema cache"
```

This indicates that the database table structure doesn't match what the application code expects.

## Root Cause
The issue occurs when:
1. The `transactions` table uses `category` (TEXT) column instead of `category_id` (UUID foreign key)
2. The table doesn't exist at all
3. The table exists but has incorrect column structure

## Solution

### Step 1: Fix Database Schema
Run the SQL script in Supabase SQL Editor:
```sql
-- File: /sql/fix_schema.sql
-- This script will:
-- 1. Create proper table structure with foreign keys
-- 2. Backup old data if table exists with wrong structure
-- 3. Insert default categories
-- 4. Set up proper RLS policies
```

### Step 2: Application-Level Fallback
The code now includes fallback mechanisms:
```typescript
// Try modern schema first (category_id)
let { error: insertError } = await supabase
  .from('transactions')
  .insert([{ /* with category_id */ }])

// If that fails, try legacy schema (category)
if (insertError && insertError.message?.includes('category_id')) {
  const { error: fallbackError } = await supabase
    .from('transactions')
    .insert([{ /* with category text */ }])
  insertError = fallbackError
}
```

### Step 3: Enhanced Error Handling
- Better error messages for users
- Direct link to database setup page
- Automatic user/account creation if missing

## Files Modified
- `/src/app/transactions/add/page.tsx` - Enhanced with fallback logic
- `/src/app/debug/schema/page.tsx` - Database diagnostic page
- `/sql/fix_schema.sql` - Complete database setup script

## Testing
1. Visit `/debug/schema` to check database status
2. Run the SQL script if needed
3. Try adding a transaction at `/transactions/add`
4. Verify transaction appears in `/transactions`

## Prevention
- Always run the complete SQL setup script when setting up new environments
- Use the debug page to verify database structure before deployment
- Keep database migrations in version control