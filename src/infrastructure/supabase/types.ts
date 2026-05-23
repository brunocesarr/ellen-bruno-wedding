import type { Database } from '@/types/database.types'
import type { CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Canonical typed Supabase client.
 * After upgrading @supabase/ssr to 0.7+ both packages share the same
 * SupabaseClient type, so SupabaseClient<Database> resolves consistently.
 */
export type TypedSupabaseClient = SupabaseClient<Database>

export type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}
