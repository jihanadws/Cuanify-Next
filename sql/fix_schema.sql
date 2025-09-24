-- Complete Database Setup for Cuanify
-- Run this in Supabase SQL Editor to fix schema issues
-- This will create the correct table structure with category_id foreign keys

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE account_type AS ENUM ('CHECKING', 'SAVINGS', 'CREDIT_CARD', 'INVESTMENT', 'CASH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE category_type AS ENUM ('INCOME', 'EXPENSE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE budget_period AS ENUM ('WEEKLY', 'MONTHLY', 'YEARLY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type category_type NOT NULL,
    color TEXT NOT NULL DEFAULT '#6b7280',
    icon TEXT NOT NULL DEFAULT '📄',
    is_default BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: default categories have no user_id, user categories must have user_id
    CONSTRAINT categories_user_check CHECK (
        (is_default = TRUE AND user_id IS NULL) OR 
        (is_default = FALSE AND user_id IS NOT NULL)
    )
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type account_type NOT NULL DEFAULT 'CASH',
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency TEXT DEFAULT 'IDR',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop old transactions table if it has wrong structure
DO $$ 
BEGIN
    -- Check if transactions table exists with old structure (category column)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'category' 
        AND table_schema = 'public'
    ) THEN
        -- Backup data if needed
        CREATE TABLE IF NOT EXISTS transactions_backup AS SELECT * FROM public.transactions;
        DROP TABLE public.transactions CASCADE;
    END IF;
END $$;

-- Create transactions table with correct structure
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id),
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    type transaction_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id),
    amount DECIMAL(15,2) NOT NULL,
    period budget_period NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    target_date DATE,
    is_achieved BOOLEAN DEFAULT FALSE,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.categories (name, type, color, icon, is_default, user_id) VALUES
('Makanan & Minuman', 'EXPENSE', '#ef4444', '🍔', TRUE, NULL),
('Transportasi', 'EXPENSE', '#f97316', '🚗', TRUE, NULL),
('Belanja', 'EXPENSE', '#eab308', '🛒', TRUE, NULL),
('Hiburan', 'EXPENSE', '#a855f7', '🎮', TRUE, NULL),
('Kesehatan', 'EXPENSE', '#06b6d4', '🏥', TRUE, NULL),
('Pendidikan', 'EXPENSE', '#3b82f6', '📚', TRUE, NULL),
('Tagihan', 'EXPENSE', '#f59e0b', '📄', TRUE, NULL),
('Lainnya', 'EXPENSE', '#6b7280', '📦', TRUE, NULL),
('Gaji', 'INCOME', '#22c55e', '💰', TRUE, NULL),
('Bonus', 'INCOME', '#10b981', '🎁', TRUE, NULL),
('Investasi', 'INCOME', '#059669', '📈', TRUE, NULL),
('Freelance', 'INCOME', '#16a34a', '💼', TRUE, NULL),
('Penjualan', 'INCOME', '#15803d', '🏪', TRUE, NULL),
('Lainnya', 'INCOME', '#84cc16', '💸', TRUE, NULL)
ON CONFLICT (name, type, is_default) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON public.budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_is_default ON public.categories(is_default);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY IF NOT EXISTS "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert their own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for categories
CREATE POLICY IF NOT EXISTS "Users can view all categories" ON public.categories
    FOR SELECT USING (is_default = TRUE OR user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can manage their own categories" ON public.categories
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Users can create their own categories" ON public.categories
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Create RLS policies for accounts
CREATE POLICY IF NOT EXISTS "Users can manage their own accounts" ON public.accounts
    FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for transactions
CREATE POLICY IF NOT EXISTS "Users can manage their own transactions" ON public.transactions
    FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for budgets
CREATE POLICY IF NOT EXISTS "Users can manage their own budgets" ON public.budgets
    FOR ALL USING (user_id = auth.uid());

-- Create RLS policies for goals
CREATE POLICY IF NOT EXISTS "Users can manage their own goals" ON public.goals
    FOR ALL USING (user_id = auth.uid());

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_accounts_updated_at BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_budgets_updated_at BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_goals_updated_at BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database setup completed successfully! All tables created with proper foreign keys.' as status;