# Cuanify Database Setup Guide

## 🔧 Database Error Fix

If you're seeing the error `Error fetching transactions: {}`, it means the database tables haven't been created yet in your Supabase project.

## 📋 Setup Instructions

### 1. Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Log in to your account
3. Select your project

### 2. Run SQL Migration
1. In your Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the entire content from `sql/complete_setup.sql`
4. Click **RUN** to execute the migration

### 3. Verify Tables Creation
After running the migration, you should see these tables in your **Table Editor**:
- ✅ `profiles` - User profile information
- ✅ `transactions` - Financial transactions
- ✅ `accounts` - User accounts (bank, wallet, etc.)
- ✅ `budgets` - Budget management

### 4. Test the Application
1. Restart your development server: `npm run dev`
2. Navigate to `/budgets` page
3. The error should be resolved

## 🔒 Security Features

The setup includes:
- **Row Level Security (RLS)** enabled on all tables
- **Policies** ensuring users can only access their own data
- **Automatic triggers** for:
  - Profile creation on user signup
  - Updating timestamps on record changes

## 🗃️ Database Schema

### Profiles Table
```sql
profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Transactions Table
```sql
transactions (
  id UUID PRIMARY KEY,
  user_id UUID,
  type TEXT, -- 'income' or 'expense'
  category TEXT,
  amount DECIMAL(15,2),
  description TEXT,
  account TEXT,
  date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Accounts Table
```sql
accounts (
  id UUID PRIMARY KEY,
  user_id UUID,
  name TEXT,
  type TEXT, -- 'bank', 'cash', 'ewallet', etc.
  balance DECIMAL(15,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Budgets Table
```sql
budgets (
  id UUID PRIMARY KEY,
  user_id UUID,
  category TEXT,
  amount DECIMAL(15,2),
  period TEXT, -- 'weekly', 'monthly', etc.
  spent DECIMAL(15,2),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🚨 Troubleshooting

### Still seeing errors?
1. **Check Supabase connection**: Verify your `.env.local` file has correct Supabase credentials
2. **Check browser console**: Look for detailed error messages
3. **Verify RLS policies**: Ensure policies are created correctly
4. **Check user authentication**: Make sure you're logged in

### Common Issues
- **"relation does not exist"**: Tables weren't created - run the SQL migration
- **"permission denied"**: RLS policies issue - check the policies setup
- **"undefined user_id"**: Authentication issue - ensure user is logged in

## 📞 Support

If you continue experiencing issues:
1. Check the browser console for detailed error messages
2. Verify all tables exist in Supabase Table Editor
3. Ensure RLS policies are enabled and configured correctly