import type {
  IAnimationSender,
  INotificationService,
} from '@/src/application/services/notification.service.interface'
import {
  buildWeddingCountdownMessage,
  daysUntil,
} from '@/src/lib/wedding-countdown'

type Deps = {
  notificationService: INotificationService & Partial<IAnimationSender>
  /** "YYYY-MM-DD" */
  weddingDate: string
  couple: string
  displayDate: string
  /** Public URL of the animated GIF for a given number of days left. */
  animationUrl?: (daysLeft: number) => string
}

/**
 * Daily dog-themed countdown to the wedding, sent as one Telegram message.
 * Goes out as a GIF with the text as caption; if the GIF can't be sent (not
 * deployed yet, Telegram can't fetch it) it falls back to the plain text, so
 * the countdown is never lost over a missing image. Sends nothing outside the countdown window (too early, or after the day).
 *
 * Triggered by a scheduled job, so it does not call authService — the route
 * is guarded by CRON_SECRET. `today` is injected ("YYYY-MM-DD", already in the
 * couple's timezone). A send failure is NOT swallowed, so the run fails.
 */
export function notifyWeddingCountdownUseCase(deps: Deps) {
  return async (
    today: string
  ): Promise<{ sent: boolean; daysLeft: number }> => {
    const daysLeft = daysUntil(today, deps.weddingDate)
    const message = buildWeddingCountdownMessage({
      daysLeft,
      couple: deps.couple,
      displayDate: deps.displayDate,
    })

    if (!message) return { sent: false, daysLeft }

    const { notificationService, animationUrl } = deps
    if (animationUrl && notificationService.sendAnimation) {
      try {
        await notificationService.sendAnimation(animationUrl(daysLeft), message)
        return { sent: true, daysLeft }
      } catch (error) {
        console.warn('[wedding-countdown] GIF failed, sending text', error)
      }
    }

    await notificationService.send(message)
    return { sent: true, daysLeft }
  }
}
