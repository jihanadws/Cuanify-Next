import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not set')
    // Return a minimal mock client for build time
    const mockClient = {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        signUp: () => Promise.resolve({ 
          data: { user: null, session: null }, 
          error: { message: 'Supabase not configured. Please add environment variables.' } 
        }),
        signInWithPassword: () => Promise.resolve({ 
          data: { user: null, session: null }, 
          error: { message: 'Supabase not configured. Please add environment variables.' } 
        }),
        verifyOtp: () => Promise.resolve({ 
          data: { user: null, session: null }, 
          error: { message: 'Supabase not configured. Please add environment variables.' } 
        })
      },
      from: () => {
        const mockQuery = {
          select: () => mockQuery,
          insert: () => mockQuery,
          update: () => mockQuery,
          delete: () => mockQuery,
          eq: () => mockQuery,
          order: () => mockQuery,
          then: (callback: (result: { data: unknown[] | null, error: null }) => unknown) => {
            return Promise.resolve(callback({ data: [], error: null }))
          }
        }
        return mockQuery
      }
    }
    // Use type assertion for build compatibility
    return mockClient as ReturnType<typeof createServerClient>
  }

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}