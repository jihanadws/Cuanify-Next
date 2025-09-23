# ✅ SOLUSI ERROR: Policy Already Exists

## ERROR YANG MUNCUL:
```
ERROR: 42710: policy "Users can insert own profile" for table "users" already exists
```

## PENYEBAB:
Policy RLS sudah ada sebelumnya, jadi tidak bisa dibuat lagi dengan nama yang sama.

## SOLUSI LANGSUNG:

### OPSI 1: Gunakan SQL Aman (RECOMMENDED) ⚡
Copy paste SQL ini ke Supabase SQL Editor (menggantikan yang sebelumnya):

```sql
-- SAFE SQL - Tidak akan error meski policy sudah ada
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can insert own profile" ON users 
FOR INSERT WITH CHECK (auth.uid() = id);

DROP FUNCTION IF EXISTS create_user_if_not_exists() CASCADE;

CREATE OR REPLACE FUNCTION create_user_if_not_exists()
RETURNS trigger AS $$
BEGIN
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

DROP TRIGGER IF EXISTS create_user_before_category ON categories;
CREATE TRIGGER create_user_before_category
    BEFORE INSERT ON categories
    FOR EACH ROW 
    EXECUTE FUNCTION create_user_if_not_exists();

SELECT 'Setup completed successfully!' as status;
```

### OPSI 2: Skip Policy, Hanya Jalankan Trigger 🔧
Jika policy sudah ada dan bekerja, jalankan hanya bagian trigger:

```sql
-- Hanya trigger saja (skip policy yang sudah ada)
DROP FUNCTION IF EXISTS create_user_if_not_exists() CASCADE;

CREATE OR REPLACE FUNCTION create_user_if_not_exists()
RETURNS trigger AS $$
BEGIN
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

DROP TRIGGER IF EXISTS create_user_before_category ON categories;
CREATE TRIGGER create_user_before_category
    BEFORE INSERT ON categories
    FOR EACH ROW 
    EXECUTE FUNCTION create_user_if_not_exists();
```

## HASIL YANG DIHARAPKAN:
Setelah menjalankan salah satu SQL di atas, Anda akan melihat:
```
Setup completed successfully!
```

## TEST SETELAH SQL BERHASIL:
1. ✅ Coba buat kategori baru - tidak boleh ada error foreign key
2. ✅ Test email verification - AuthRedirectHandler akan handle
3. ✅ Login/signup flow - seharusnya lancar

## CATATAN PENTING:
- Policy yang sudah ada kemungkinan sudah benar
- Yang penting adalah trigger untuk auto-create user
- Setelah trigger dibuat, foreign key constraint error akan hilang

**REKOMENDASI: Gunakan OPSI 1 (SQL Aman) untuk memastikan semua setup benar!** ✅