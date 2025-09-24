-- Emergency Database Fix for Cuanify
-- This script will fix the immediate issues without breaking existing data
-- Run this in Supabase SQL Editor

-- 1. First, let's check the current structure and backup data
DO $$
BEGIN
    -- Create backup table for transactions if it doesn't exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transactions') THEN
        CREATE TABLE IF NOT EXISTS transactions_backup_$(date +%Y%m%d) AS 
        SELECT * FROM transactions;
        RAISE NOTICE 'Backup created for transactions table';
    END IF;
END $$;

-- 2. Add missing columns to accounts table if they don't exist
DO $$
BEGIN
    -- Add currency column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'currency'
    ) THEN
        ALTER TABLE accounts ADD COLUMN currency TEXT DEFAULT 'IDR';
        RAISE NOTICE 'Added currency column to accounts table';
    END IF;

    -- Add is_active column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE accounts ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added is_active column to accounts table';
    END IF;
END $$;

-- 3. Handle transactions table structure
DO $$
BEGIN
    -- Check if category_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'category_id'
    ) THEN
        -- Add category_id column
        ALTER TABLE transactions ADD COLUMN category_id UUID;
        RAISE NOTICE 'Added category_id column to transactions table';
        
        -- Try to map existing category text to category_id
        UPDATE transactions SET category_id = (
            SELECT c.id FROM categories c 
            WHERE c.name = transactions.category 
            LIMIT 1
        ) WHERE category IS NOT NULL AND category_id IS NULL;
        
        RAISE NOTICE 'Mapped existing category text to category_id';
    END IF;

    -- Check if account_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'account_id'
    ) THEN
        -- Add account_id column
        ALTER TABLE transactions ADD COLUMN account_id UUID;
        RAISE NOTICE 'Added account_id column to transactions table';
        
        -- Set account_id to first available account for each user
        UPDATE transactions SET account_id = (
            SELECT a.id FROM accounts a 
            WHERE a.user_id = transactions.user_id 
            LIMIT 1
        ) WHERE account_id IS NULL;
        
        RAISE NOTICE 'Mapped transactions to user accounts';
    END IF;
END $$;

-- 4. Normalize transaction types to uppercase
UPDATE transactions 
SET type = UPPER(type) 
WHERE type IS NOT NULL AND type != UPPER(type);

-- 5. Create foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add foreign key for category_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_transactions_category_id'
    ) THEN
        ALTER TABLE transactions 
        ADD CONSTRAINT fk_transactions_category_id 
        FOREIGN KEY (category_id) REFERENCES categories(id);
        RAISE NOTICE 'Added foreign key constraint for category_id';
    END IF;

    -- Add foreign key for account_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_transactions_account_id'
    ) THEN
        ALTER TABLE transactions 
        ADD CONSTRAINT fk_transactions_account_id 
        FOREIGN KEY (account_id) REFERENCES accounts(id);
        RAISE NOTICE 'Added foreign key constraint for account_id';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Note: Foreign key constraints may fail if there are orphaned records';
END $$;

-- 6. Create missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);

-- 7. Verify the fixes
SELECT 
    'Database structure updated successfully!' as status,
    (SELECT COUNT(*) FROM transactions) as total_transactions,
    (SELECT COUNT(*) FROM transactions WHERE type = 'INCOME') as income_count,
    (SELECT COUNT(*) FROM transactions WHERE type = 'EXPENSE') as expense_count,
    (SELECT COUNT(*) FROM accounts) as total_accounts,
    (SELECT COUNT(*) FROM categories) as total_categories;

-- 8. Show any remaining issues
SELECT 
    'Check for remaining issues:' as info,
    (SELECT COUNT(*) FROM transactions WHERE category_id IS NULL) as transactions_without_category,
    (SELECT COUNT(*) FROM transactions WHERE account_id IS NULL) as transactions_without_account,
    (SELECT COUNT(*) FROM accounts WHERE currency IS NULL) as accounts_without_currency;