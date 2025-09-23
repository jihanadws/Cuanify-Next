# 🔧 Konfigurasi Supabase untuk Email Konfirmasi

## 📋 Langkah-Langkah Konfigurasi

### 1. **Login ke Supabase Dashboard**
1. Buka [https://app.supabase.com](https://app.supabase.com)
2. Login dengan akun Anda
3. Pilih project Cuanify Anda

### 2. **Konfigurasi Email Templates**
1. Di sidebar kiri, klik **Authentication**
2. Klik tab **Email Templates**
3. Pilih **Confirm signup**
4. Edit template dengan konfigurasi berikut:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a></p>

<p>Or copy and paste this URL into your browser:</p>
<p>{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email</p>
```

### 3. **Konfigurasi Site URL**
1. Di sidebar, klik **Settings**
2. Klik **General**
3. Scroll ke bagian **Site URL**
4. Ubah Site URL menjadi:

**Development:**
```
http://localhost:3002
```

**Production (nanti):**
```
https://your-domain.com
```

### 4. **Konfigurasi Redirect URLs**
1. Masih di halaman **Settings > General**
2. Scroll ke bagian **Redirect URLs**
3. Tambahkan URL berikut:

**Development:**
```
http://localhost:3002/auth/confirm
http://localhost:3002/dashboard
http://localhost:3002/auth/signin
```

**Production (nanti):**
```
https://your-domain.com/auth/confirm
https://your-domain.com/dashboard
https://your-domain.com/auth/signin
```

### 5. **Konfigurasi Email Settings (Opsional)**
1. Di sidebar, klik **Settings**
2. Klik **Auth**
3. Scroll ke **Email Auth**
4. Pastikan **Enable email confirmations** dicentang
5. **Enable email change confirmations** (opsional)
6. **Secure email change** (opsional)

## 🧪 Testing Konfigurasi

### 1. **Test Email Confirmation Flow**
1. Jalankan aplikasi: `npm run dev`
2. Buka http://localhost:3002
3. Daftar dengan email baru
4. Periksa inbox email
5. Klik link konfirmasi di email
6. Pastikan diarahkan ke `/auth/confirm`
7. Pastikan kemudian diarahkan ke `/dashboard`

### 2. **Verifikasi di Database**
```sql
-- Cek status konfirmasi di Supabase SQL Editor
SELECT 
  id, 
  email, 
  email_confirmed_at,
  created_at
FROM auth.users 
ORDER BY created_at DESC;
```

## 🔍 Troubleshooting

### Problem: Link mengarah ke home page
**Penyebab:** Site URL belum dikonfigurasi dengan benar
**Solusi:**
1. Periksa Site URL di Supabase Dashboard
2. Pastikan sesuai dengan URL development (`http://localhost:3002`)
3. Tunggu 1-2 menit setelah mengubah konfigurasi

### Problem: "Invalid link" atau "Token expired"
**Penyebab:** Link sudah digunakan atau kedaluwarsa
**Solusi:**
1. Minta email konfirmasi baru
2. Gunakan link yang paling baru
3. Periksa apakah email sudah dikonfirmasi sebelumnya

### Problem: Link konfirmasi tidak diterima
**Penyebab:** Email template tidak dikonfigurasi atau email masuk spam
**Solusi:**
1. Periksa konfigurasi email template
2. Periksa folder spam/junk
3. Whitelist domain @app.supabase.io

### Problem: Redirect setelah konfirmasi tidak bekerja
**Penyebab:** Redirect URLs tidak dikonfigurasi
**Solusi:**
1. Tambahkan semua URL yang diperlukan ke Redirect URLs
2. Restart development server
3. Clear browser cache

## 📧 Custom Email Provider (Opsional)

Jika ingin menggunakan email provider sendiri (Gmail, SendGrid, dll):

### 1. **Konfigurasi SMTP**
1. Di **Settings > Auth**
2. Scroll ke **SMTP Settings**
3. Enable **Use custom SMTP server**
4. Isi konfigurasi SMTP Anda:

```
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: your-app-password
```

### 2. **Update Email Templates**
Sesuaikan email templates dengan branding Anda di **Authentication > Email Templates**

## 🚀 Production Checklist

Sebelum deploy ke production:

- [ ] Update Site URL ke domain production
- [ ] Update Redirect URLs ke domain production  
- [ ] Konfigurasi custom SMTP (recommended)
- [ ] Test email confirmation di production
- [ ] Setup monitoring untuk email delivery
- [ ] Backup konfigurasi email templates

## 📝 Environment Variables

Pastikan environment variables sudah benar:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3002  # atau domain production
```

## 🆘 Bantuan Lebih Lanjut

Jika masih ada masalah:
1. Periksa Supabase logs di dashboard
2. Periksa browser console untuk error
3. Cek network tab untuk request yang gagal
4. Pastikan semua konfigurasi sudah disimpan

---

**💡 Tip:** Selalu test email confirmation flow setelah mengubah konfigurasi untuk memastikan semuanya bekerja dengan baik.