import 'server-only'

import type { INotificationService } from '@/src/application/services/notification.service.interface'

type TelegramConfig = { botToken: string; chatId: string }

function readConfig(): TelegramConfig | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) return null
  return { botToken, chatId }
}

export class TelegramNotificationService implements INotificationService {
  constructor(private readonly config: TelegramConfig) {}

  async send(message: string): Promise<void> {
    const res = await fetch(
      `https://api.telegram.org/bot${this.config.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.config.chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    )

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Telegram API respondeu ${res.status}: ${body}`)
    }
  }
}

/** Dev/CI fallback so missing credentials never break the flow. */
export class NoopNotificationService implements INotificationService {
  async send(message: string): Promise<void> {
    console.info('[NoopNotificationService] notification suppressed', {
      message,
    })
  }
}

export function createNotificationService(): INotificationService {
  const config = readConfig()

  if (!config) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[createNotificationService] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID ' +
          'missing in production — falling back to no-op.'
      )
    }
    return new NoopNotificationService()
  }

  return new TelegramNotificationService(config)
}
