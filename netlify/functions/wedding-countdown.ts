import type { Config } from '@netlify/functions'

/**
 * Daily trigger for the dog-themed wedding countdown Telegram message. It only calls the
 * Next.js route (which holds the use case and the Supabase/Telegram wiring),
 * so no app code is bundled here. Needs CRON_SECRET; the site URL comes from
 * NEXT_PUBLIC_SITE_URL, falling back to Netlify's own URL.
 */
const handler = async (_: Request) => {
  const secret = process.env.CRON_SECRET
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL)?.replace(
    /\/+$/,
    ''
  )

  if (!secret || !site) {
    console.error('[wedding-countdown] Missing CRON_SECRET or site URL', {
      hasSecret: !!secret,
      hasSite: !!site,
    })
    return new Response('Missing configuration', { status: 500 })
  }

  try {
    const res = await fetch(`${site}/api/wedding-countdown`, {
      headers: { authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(20_000),
    })
    console.log('[wedding-countdown] status', res.status, await res.text())
    return new Response(res.ok ? 'OK' : 'Failed', {
      status: res.ok ? 200 : 502,
    })
  } catch (e) {
    console.error('[wedding-countdown] request failed', (e as Error).message)
    return new Response('Unreachable', { status: 503 })
  }
}

// 12:00 UTC = 09:00 in Brasília.
export const config: Config = { schedule: '0 12 * * *' }
export default handler
