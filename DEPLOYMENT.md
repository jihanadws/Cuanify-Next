# Vercel Deployment Instructions

## Environment Variables Required

You need to set the following environment variables in your Vercel project:

1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Finding Your Supabase Credentials

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" and "Project API keys" (anon/public key)

## Deployment Steps

1. Set the environment variables in Vercel
2. Push your code to the connected branch
3. Vercel will automatically rebuild and deploy

## Notes

- The application includes fallback handling for missing environment variables during build time
- Make sure both environment variables are set before deployment
- Use the "anon" key, not the "service_role" key for the public key