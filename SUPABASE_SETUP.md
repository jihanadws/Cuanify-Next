# 🚀 Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign in with GitHub/Google
4. Click "New Project"
5. Choose your organization
6. Enter project details:
   - Name: `cuanify-app`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your location)
7. Click "Create new project"
8. Wait for setup to complete (2-3 minutes)

## Step 2: Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://your-project-ref.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Update Environment Variables

Update your `.env.local` file with real values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_real_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_real_service_role_key_here
```

## Step 4: Setup Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste the SQL schema from `supabase/schema.sql`
3. Click "Run" to create all tables

## Step 5: Test Connection

After updating environment variables, restart your development server:
```bash
npm run dev
```

## ⚠️ Important Notes:

- Keep your service_role key secret (never commit to git)
- The anon key is safe to use in frontend code
- Make sure to enable Row Level Security (RLS) policies
- Default authentication is email + password

## 🔧 Current Status:

- ❌ Environment variables are placeholder values
- ❌ No actual Supabase project connected
- ❌ Authentication is using dummy code
- ✅ Supabase client configuration is ready
- ✅ Database schema is prepared