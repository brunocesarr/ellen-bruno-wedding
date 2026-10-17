import type { Config } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

// Tables worth restoring after a mistake. The free Supabase plan has no
// automatic backups, so this is the safety net.
const TABLES = [
  'guests',
  'rsvp',
  'rsvp_requests',
  'gifts',
  'pix_confirmations',
  'invite_links',
  'guest_manager_links',
  'site_images',
] as const

const BUCKET = 'backups'
const KEEP_LAST = 14

const handler = async (_: Request) => {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '')
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!url || !secretKey) {
    console.error('[backup] Missing SUPABASE_URL / SUPABASE_SECRET_KEY')
    return new Response('Missing configuration', { status: 500 })
  }

  const supabase = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const dump: Record<string, unknown[]> = {}
  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select('*')
    if (error) {
      // Skip a failing table rather than losing the whole backup.
      console.error(`[backup] ${table} failed:`, error.code, error.message)
      continue
    }
    dump[table] = data ?? []
  }

  const stamp = new Date().toISOString()
  const path = `${stamp.slice(0, 10)}.json`
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, JSON.stringify({ createdAt: stamp, tables: dump }), {
      contentType: 'application/json',
      upsert: true,
    })
  if (uploadError) {
    console.error('[backup] upload failed:', uploadError.message)
    return new Response('Upload failed', { status: 500 })
  }

  // Rotation: names are ISO dates, so lexical order is chronological.
  const { data: files } = await supabase.storage.from(BUCKET).list('', {
    limit: 100,
    sortBy: { column: 'name', order: 'asc' },
  })
  const stale = (files ?? []).slice(
    0,
    Math.max(0, (files?.length ?? 0) - KEEP_LAST)
  )
  if (stale.length > 0) {
    await supabase.storage.from(BUCKET).remove(stale.map((f) => f.name))
  }

  console.log('[backup] OK', path, Object.keys(dump).length, 'tables')
  return new Response('OK', { status: 200 })
}

// Daily at 06:00 UTC (03:00 in Brasília).
export const config: Config = { schedule: '0 6 * * *' }
export default handler
