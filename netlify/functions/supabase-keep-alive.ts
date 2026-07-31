import type { Config } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

export default async () => {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error('[keep-alive] Missing Supabase env vars')
    return new Response('Missing configuration', { status: 500 })
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // 1. WRITE — guarantees a real Postgres transaction
  const { error: insertError } = await supabase
    .from('keep_alive')
    .insert({ source: 'netlify-scheduled-function' })

  if (insertError) {
    console.error('[keep-alive] Insert failed:', insertError.message)
    return new Response('Insert failed', { status: 500 })
  }

  // 2. READ — a second uncacheable query for good measure
  const { count, error: readError } = await supabase
    .from('keep_alive')
    .select('*', { count: 'exact', head: true })

  if (readError) {
    console.error('[keep-alive] Read failed:', readError.message)
    return new Response('Read failed', { status: 500 })
  }

  console.log(`[keep-alive] OK — ${count} rows, ${new Date().toISOString()}`)
  return new Response('OK', { status: 200 })
}

export const config: Config = {
  schedule: '0 6 */2 * *', // 06:00 UTC, every 2 days
}
