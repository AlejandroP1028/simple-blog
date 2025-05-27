import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const createServerClientSupabase = () => {
    const cookieStore = cookies()
  
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll().map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }))
          },
          // This is required but usually not needed here — setting cookies is done in a route response
          setAll() {
            // No-op for now. You can handle cookie setting in route handlers or middleware.
          },
        },
      }
    )
  }