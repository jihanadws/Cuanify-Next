-- Fix missing INSERT policy for users table
-- Run this SQL in Supabase SQL Editor

-- Drop existing policy if exists, then create new one
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Add INSERT policy for users table
CREATE POLICY "Users can insert own profile" ON users 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Optional: Create trigger to auto-create user on category insert
CREATE OR REPLACE FUNCTION create_user_if_not_exists()
RETURNS trigger AS $$
BEGIN
    -- Only run for non-default categories
    IF NEW.user_id IS NOT NULL THEN
        INSERT INTO public.users (id, email, name, created_at, updated_at)
        VALUES (
            NEW.user_id, 
            COALESCE((SELECT email FROM auth.users WHERE id = NEW.user_id), ''),
            COALESCE((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = NEW.user_id), 'User'),
            NOW(), 
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS create_user_before_category ON categories;
CREATE TRIGGER create_user_before_category
    BEFORE INSERT ON categories
    FOR EACH ROW 
    EXECUTE FUNCTION create_user_if_not_exists();