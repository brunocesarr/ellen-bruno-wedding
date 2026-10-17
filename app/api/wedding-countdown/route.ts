import { notifyWeddingCountdownUseCase } from '@/src/application/use-cases/wedding/notify-wedding-countdown.use-case'
import { createNotificationService } from '@/src/infrastructure/services/telegram-notification.service'
import { WEDDING_DETAILS } from '@/src/lib/constants'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Today's date as "YYYY-MM-DD" in the couple's timezone (not UTC). */
const todayInSaoPaulo = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(
    new Date()
  )

/** Absolute URL Telegram can fetch the day's GIF from (public/images/countdown). */
const animationUrl = (daysLeft: number) => {
  const site = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.URL ??
    ''
  ).replace(/\/+$/, '')
  return `${site}/images/countdown/day-${daysLeft}.gif`
}

/**
 * Daily dog-themed wedding countdown. Called by
 * netlify/functions/wedding-countdown.ts on a schedule; same Bearer
 * CRON_SECRET guard as /api/expense-alerts. Returns 500 on failure so the
 * scheduled run shows as failed.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  try {
    const result = await notifyWeddingCountdownUseCase({
      notificationService: createNotificationService(),
      weddingDate: WEDDING_DETAILS.date,
      couple: `${WEDDING_DETAILS.couple.bride} & ${WEDDING_DETAILS.couple.groom}`,
      displayDate: WEDDING_DETAILS.displayDate,
      animationUrl,
    })(todayInSaoPaulo())

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[wedding-countdown] failed', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
