import type { Config } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const handler = async (req: Request) => {
  const rawUrl = process.env.SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY

  // --- 1. Presence ---
  if (!rawUrl || !secretKey) {
    console.error('[keep-alive] Missing env vars', {
      hasUrl: !!rawUrl,
      hasKey: !!secretKey,
    })
    return new Response('Missing configuration', { status: 500 })
  }

  // --- 2. Shape (never log the key itself) ---
  const url = rawUrl.trim().replace(/\/+$/, '')
  console.log('[keep-alive] URL:', url)
  console.log(
    '[keep-alive] key prefix:',
    secretKey.slice(0, 12),
    'len:',
    secretKey.length
  )

  if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|red)$/.test(url)) {
    console.error('[keep-alive] Malformed SUPABASE_URL:', url)
    return new Response('Malformed URL', { status: 500 })
  }

  // --- 3. Raw reachability: distinguishes DNS failure from auth/DB errors ---
  try {
    const probe = await fetch(`${url}/rest/v1/`, {
      headers: { apikey: secretKey },
      signal: AbortSignal.timeout(10_000),
    })
    console.log('[keep-alive] probe status:', probe.status)
  } catch (e) {
    console.error(
      '[keep-alive] NETWORK FAILURE — project likely PAUSED or URL wrong.',
      'cause:',
      (e as any)?.cause?.code ?? (e as Error).message
    )
    return new Response('Unreachable', { status: 503 })
  }

  // --- 4. Real DB write ---
  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error } = await supabase
    .from('keep_alive')
    .upsert(
      { id: 1, pinged_at: new Date().toISOString(), source: 'netlify' },
      { onConflict: 'id' }
    )

  if (error) {
    console.error('[keep-alive] DB error:', error.code, error.message)
    return new Response('DB failed', { status: 500 })
  }

  console.log('[keep-alive] OK', new Date().toISOString())
  return new Response('OK', { status: 200 })
}

export const config: Config = { schedule: '0 6 * * *' }
export default handler
