-- SAFE SQL FIX - Menghindari error duplikasi
-- Copy paste SQL ini ke Supabase SQL Editor dan klik RUN

-- 1. Drop existing policy if exists (menghindari error duplikasi)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- 2. Create INSERT policy untuk users table
CREATE POLICY "Users can insert own profile" ON users 
FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Drop existing function if exists
DROP FUNCTION IF EXISTS create_user_if_not_exists() CASCADE;

-- 4. Create function untuk auto-create user
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

-- 5. Drop existing trigger if exists, then create new one
DROP TRIGGER IF EXISTS create_user_before_category ON categories;
CREATE TRIGGER create_user_before_category
    BEFORE INSERT ON categories
    FOR EACH ROW 
    EXECUTE FUNCTION create_user_if_not_exists();

-- 6. Verify setup (optional check)
SELECT 'Policy created successfully' as status;