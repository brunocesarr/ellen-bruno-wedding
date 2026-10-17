import 'server-only'

import { createSupabaseAdminClient } from '@/src/infrastructure/supabase/admin'
import type { ActionResult } from '@/src/lib/server-action-result'
import { headers } from 'next/headers'
import { createHash } from 'node:crypto'

type RateLimitOptions = { max: number; windowSeconds: number }

export const RATE_LIMIT_ERROR =
  'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.'

async function clientKey(): Promise<string> {
  const h = await headers()
  const ip =
    h.get('x-nf-client-connection-ip') ??
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  // Hash so the raw IP is never persisted.
  return createHash('sha256').update(ip).digest('hex').slice(0, 32)
}

/**
 * Per-IP fixed-window limiter backed by the `check_rate_limit` Postgres
 * function (free — no external service). Returns an `ActionResult`-shaped
 * error when the caller is over the limit, or `null` when the action may go
 * ahead. Fails OPEN: a limiter outage must not stop guests from RSVPing.
 */
export async function enforceRateLimit(
  bucket: string,
  { max, windowSeconds }: RateLimitOptions
): Promise<Extract<ActionResult<never>, { ok: false }> | null> {
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: `${bucket}:${await clientKey()}`,
      p_max: max,
      p_window_seconds: windowSeconds,
    })
    if (error) throw error
    return data === false ? { ok: false, error: RATE_LIMIT_ERROR } : null
  } catch (e) {
    // Next's dynamic-usage signal must keep propagating.
    if ((e as { digest?: string })?.digest === 'DYNAMIC_SERVER_USAGE') throw e
    console.error('[rate-limit] failed open', e)
    return null
  }
}
