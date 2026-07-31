import type { Config } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

export default async () => {
  const url = process.env.SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY

  if (!url || !secretKey) {
    console.error('[keep-alive] Missing env vars')
    return new Response('Missing configuration', { status: 500 })
  }

  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Upsert a single fixed row — table never grows
  const { error } = await supabase
    .from('keep_alive')
    .upsert(
      { id: 1, pinged_at: new Date().toISOString(), source: 'netlify' },
      { onConflict: 'id' }
    )

  if (error) {
    console.error('[keep-alive] FAILED:', error.message)
    // Optional: notify yourself
    if (process.env.ALERT_WEBHOOK_URL) {
      await fetch(process.env.ALERT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🚨 Supabase keep-alive failed: ${error.message}`,
        }),
      }).catch(() => {})
    }
    return new Response('Failed', { status: 500 })
  }

  console.log(`[keep-alive] OK ${new Date().toISOString()}`)
  return new Response('OK', { status: 200 })
}

export const config: Config = {
  schedule: '0 6 * * *', // daily, 06:00 UTC — no month-boundary gap
}
