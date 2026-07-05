import type { Database } from '@/types/database.types'
import type { CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

export type TypedSupabaseClient = SupabaseClient<Database>

export type CookieToSet = {
  name: string
  value: string
  options: CookieOptions
}
