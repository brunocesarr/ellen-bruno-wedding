import 'server-only'

import type { Database } from '@/types/database.types'
import { createClient } from '@supabase/supabase-js'
import type { TypedSupabaseClient } from './types'

let publicClient: TypedSupabaseClient | null = null

export function createSupabasePublicServerClient(): TypedSupabaseClient {
  if (publicClient) return publicClient

  publicClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )

  return publicClient
}
