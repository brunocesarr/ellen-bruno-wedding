import { requireEnv } from '@/src/lib/env'
import type { Database } from '@/types/database.types'
import { createClient } from '@supabase/supabase-js'
import type { TypedSupabaseClient } from './types'

export function createSupabaseAdminClient(): TypedSupabaseClient {
  return createClient<Database>(
    requireEnv(
      'NEXT_PUBLIC_SUPABASE_URL',
      process.env.NEXT_PUBLIC_SUPABASE_URL
    ),
    requireEnv('SUPABASE_SECRET_KEY', process.env.SUPABASE_SECRET_KEY),
    { auth: { persistSession: false } }
  ) as unknown as TypedSupabaseClient
}
