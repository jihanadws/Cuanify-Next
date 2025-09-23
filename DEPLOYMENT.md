# Vercel Deployment Instructions

## Current Status
✅ **Build Success**: The application builds and deploys successfully  
⚠️ **Configuration Required**: Supabase environment variables need to be set for full functionality

## Error You're Seeing
If you see these errors in the browser console:
- `Supabase environment variables are not set`
- `signInWithPassword is not a function`
- `Failed to load resource: the server responded with a status of 401`

This means the environment variables are not configured in Vercel.

## Required Environment Variables

You need to set these in your Vercel project dashboard:

### 1. `NEXT_PUBLIC_SUPABASE_URL`
Your Supabase project URL (example: `https://abcdefghijk.supabase.co`)

### 2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
Your Supabase anonymous/public key (starts with `eyJhbGciOiJIUzI1NiIs...`)

## How to Set Environment Variables in Vercel

### Step 1: Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Select your `Cuanify-Next` project

### Step 2: Add Environment Variables
1. Click on **Settings** tab
2. Click on **Environment Variables** in the left sidebar  
3. Add each variable:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Your Supabase project URL
   - **Environments**: Select all (Production, Preview, Development)
   - Click **Save**
   
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
   - **Value**: Your Supabase anon key
   - **Environments**: Select all (Production, Preview, Development)
   - Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**

## Finding Your Supabase Credentials

### Method 1: Supabase Dashboard
1. Go to [supabase.com](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → use for `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → **anon** **public** key → use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Method 2: Check Your Local Environment
If you have the app working locally, check your `.env.local` file for the values.

## Security Notes
- ✅ Use the **anon/public** key (safe for client-side)
- ❌ **Never** use the **service_role** key in environment variables (server-only)

## Verification
After setting the environment variables and redeploying:
1. Open the deployed app
2. Open browser Developer Tools (F12)
3. Check the Console tab
4. The warnings should be gone
5. Try to register/login - it should work

## Troubleshooting
- Make sure both variables are set with correct names (copy-paste recommended)
- Ensure all environments are selected when adding variables
- Wait for the redeploy to complete before testing
- Clear browser cache if needed