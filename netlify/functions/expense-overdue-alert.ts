import type { Config } from '@netlify/functions'

/**
 * Daily trigger for the overdue-expense Telegram alert. It only calls the
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
    console.error('[expense-alert] Missing CRON_SECRET or site URL', {
      hasSecret: !!secret,
      hasSite: !!site,
    })
    return new Response('Missing configuration', { status: 500 })
  }

  try {
    const res = await fetch(`${site}/api/expense-alerts`, {
      headers: { authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(20_000),
    })
    console.log('[expense-alert] status', res.status, await res.text())
    return new Response(res.ok ? 'OK' : 'Failed', {
      status: res.ok ? 200 : 502,
    })
  } catch (e) {
    console.error('[expense-alert] request failed', (e as Error).message)
    return new Response('Unreachable', { status: 503 })
  }
}

// 11:00 UTC = 08:00 in Brasília.
export const config: Config = { schedule: '0 11 * * *' }
export default handler
