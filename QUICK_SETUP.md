# 🚀 Quick Database Setup

## ⚡ Fast Setup (2 minutes)

### Step 1: Access Supabase
- Go to [supabase.com](https://supabase.com)
- Login to your project
- Click **SQL Editor** in the sidebar

### Step 2: Run Migration
1. Create a **New query**
2. **Copy** everything from `sql/complete_setup.sql`
3. **Paste** into the SQL editor
4. Click **RUN** ▶️

### Step 3: Verify Setup
- Go to **Table Editor**
- Check these tables exist:
  - ✅ `profiles`
  - ✅ `transactions` 
  - ✅ `accounts`
  - ✅ `budgets`

### Step 4: Test App
- Refresh your app: http://localhost:3001
- Try creating a transaction or updating profile
- Errors should be resolved! 🎉

---

## 🔍 If You Still See Errors

### Console Shows Database Error?
1. **F12** → Open browser console
2. Look for detailed error messages
3. Ensure all tables were created
4. Check RLS policies are enabled

### Still Not Working?
1. Verify `.env.local` has correct Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
2. Make sure you're logged in to the app
3. Check Supabase Dashboard → Authentication → Users

### Need Help?
- Check browser console for detailed error messages
- Verify your Supabase project settings
- Ensure you have the correct database permissions

---

## 📊 What Gets Created

### Tables
- **profiles** - User information (name, phone, address)
- **transactions** - Income/expense records  
- **accounts** - Bank accounts, wallets, cash
- **budgets** - Budget planning and tracking

### Security
- **Row Level Security** - Users only see their own data
- **Policies** - Automatic access control
- **Triggers** - Auto-timestamps and profile creation

### Features
- ✅ User registration → Auto profile creation
- ✅ Data isolation → Your data stays private  
- ✅ Audit trail → Track when records change
- ✅ Type safety → Validated data formats