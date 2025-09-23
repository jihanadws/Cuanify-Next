import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables are not set')
    // Return a minimal mock client for build time
    const mockClient = {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: null } })
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
    return mockClient as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}