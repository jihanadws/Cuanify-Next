# SOLUSI MASALAH EMAIL VERIFICATION - Cuanify

## MASALAH YANG DITEMUKAN:

1. **Port mismatch**: App berjalan di port 3000 tapi NEXT_PUBLIC_SITE_URL di-set ke 3002
2. **PKCE flow error**: Supabase auth callback gagal karena code verifier issue
3. **URL configuration**: Redirect URL di Supabase mungkin tidak sesuai

## SOLUSI YANG SUDAH DITERAPKAN:

### 1. Perbaikan .env.local ✅
```bash
# Sudah diperbaiki dari port 3002 ke 3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Perbaikan Auth Callback ✅
- Menggunakan server-side Supabase client untuk PKCE
- Improved error handling untuk code exchange

## LANGKAH SELANJUTNYA YANG HARUS DILAKUKAN:

### ⚡ SOLUSI UTAMA: DATABASE FIX SAJA (TANPA UBAH SITE URL)

**JALANKAN SQL DATABASE FIX**
Jalankan SQL ini di Supabase SQL Editor:

```sql
-- Copy dari fix_user_rls_policy.sql - SQL INI SAJA YANG PERLU DIJALANKAN:
CREATE POLICY "Users can insert own profile" ON users 
FOR INSERT WITH CHECK (auth.uid() = id);

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

**CATATAN PENTING:** 
- ❌ TIDAK perlu ubah Site URL di Supabase Dashboard
- ✅ AuthRedirectHandler sudah menangani email verification secara otomatis  
- ✅ Sistem existing sudah fleksibel untuk berbagai URL dan port

### ALTERNATIF: Jika ingin update Supabase URL juga (opsional)

~~### 1. KONFIGURASI SUPABASE DASHBOARD~~
~~Buka Supabase Dashboard → Authentication → URL Configuration dan pastikan:~~

~~**Site URL:**~~
~~```~~
~~http://localhost:3000~~
~~```~~

~~**Redirect URLs (tambahkan semua ini):**~~
~~```~~
~~http://localhost:3000/auth/callback~~
~~http://localhost:3000/auth/confirm~~
~~http://localhost:3000/dashboard~~
~~http://localhost:3000/**~~
~~```~~

```sql
-- Fix missing INSERT policy for users table
CREATE POLICY "Users can insert own profile" ON users 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger to auto-create user on category insert
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

-- Create trigger
DROP TRIGGER IF EXISTS create_user_before_category ON categories;
CREATE TRIGGER create_user_before_category
    BEFORE INSERT ON categories
    FOR EACH ROW 
    EXECUTE FUNCTION create_user_if_not_exists();
```

### 2. RESTART DEVELOPMENT SERVER (sudah dilakukan ✅)
```bash
# Stop current server (Ctrl+C) 
# Then restart:
npm run dev
```

### 3. TEST EMAIL VERIFICATION (menggunakan sistem existing)
1. Buka: http://localhost:3000/debug-auth
2. Masukkan email test dan klik "Send Test Email"
3. Cek inbox email untuk link verification
4. Klik link verification - seharusnya redirect ke http://localhost:3000/auth/confirm

## CARA MENGECEK APAKAH SUDAH BENAR:

### 1. Cek URL dalam email verification:
Link di email harus dimulai dengan:
```
http://localhost:3000/auth/confirm?token_hash=...
```

### 2. Cek console log:
```bash
# Harus muncul log seperti ini saat klik link verification:
Auth callback parameters: { token_hash: true, type: "signup", ... }
Confirmation parameters: { token_hash: true, type: "signup", ... }
```

### 3. Test signup flow:
1. Buka /auth/signup
2. Daftar dengan email baru
3. Cek email untuk verification link
4. Klik link → redirect ke dashboard

## JIKA MASIH ERROR:

### Error "invalid request: both auth code and code verifier should be non-empty"
- Pastikan Supabase redirect URLs sudah benar
- Restart dev server setelah update .env.local

### Error "Token not found" atau link expired
- Cek apakah NEXT_PUBLIC_SITE_URL sudah benar di .env.local
- Pastikan Supabase Site URL sama dengan local URL

### Error 403/409 saat buat kategori
- Jalankan SQL fix di atas
- Pastikan RLS policy sudah diterapkan

## DEBUG TOOLS:

1. **Debug Auth Page**: http://localhost:3000/debug-auth
   - Lihat URL parameters
   - Test email verification
   - Cek session status

2. **Console Logs**: 
   - Buka Chrome DevTools
   - Lihat Network tab untuk auth requests
   - Cek Console untuk error messages

## VALIDASI FINAL:

Setelah semua fix diterapkan, coba flow ini:
1. Register user baru → Email terkirim ✅
2. Klik link verification → Redirect berhasil ✅  
3. Login ke dashboard → Berhasil ✅
4. Buat kategori baru → Tidak ada error foreign key ✅