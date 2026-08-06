import 'server-only'

import type {
  EmailMessage,
  IEmailService,
} from '@/src/application/services/email.service.interface'
import { randomUUID } from 'node:crypto'
import nodemailer, { type Transporter } from 'nodemailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

type GmailOAuthConfig = {
  user: string
  clientId: string
  clientSecret: string
  refreshToken: string
  from: string
  replyTo: string
}

function extractAddress(value: string): string {
  const match = value.match(/<([^>]+)>/)
  return (match?.[1] ?? value).trim().toLowerCase()
}

function readGmailConfig(): GmailOAuthConfig | null {
  const user = process.env.GMAIL_USER
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!user || !clientId || !clientSecret || !refreshToken) return null

  const from = process.env.EMAIL_FROM ?? `Ellen & Bruno <${user}>`

  if (extractAddress(from) !== user.trim().toLowerCase()) {
    console.warn(
      `[createEmailService] EMAIL_FROM (${extractAddress(from)}) does not match ` +
        `GMAIL_USER (${user}). This breaks DMARC alignment and will hurt ` +
        'deliverability. Use GMAIL_USER or a verified Gmail alias.'
    )
  }

  const replyTo = process.env.EMAIL_REPLY_TO ?? user

  return { user, clientId, clientSecret, refreshToken, from, replyTo }
}

/**
 * Module-scoped, NOT an instance field.
 *
 * getContainer() is wrapped in React cache(), which is per-request. A field
 * would rebuild the transporter every request, and with OAuth2 that means
 * re-fetching an access token from Google on every single send — an extra
 * HTTP round trip before the SMTP handshake even starts.
 */
let cachedTransporter: Transporter<SMTPTransport.SentMessageInfo> | null = null

function getTransporter(
  config: GmailOAuthConfig
): Transporter<SMTPTransport.SentMessageInfo> {
  if (cachedTransporter) return cachedTransporter

  // Annotating as SMTPTransport.Options is REQUIRED: createTransport is
  // overloaded, and an un-annotated literal resolves to the generic
  // `TransportOptions` overload, which does not declare `service`.
  const options: SMTPTransport.Options = {
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: config.user,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      refreshToken: config.refreshToken,
    },

    connectionTimeout: 5_000,
    greetingTimeout: 5_000,
    socketTimeout: 8_000,

    disableFileAccess: true,
    disableUrlAccess: true,
  }

  cachedTransporter = nodemailer.createTransport(options)

  return cachedTransporter
}

export class NodemailerEmailService implements IEmailService {
  constructor(private readonly config: GmailOAuthConfig) {}

  async send(message: EmailMessage): Promise<void> {
    try {
      const info = await getTransporter(this.config).sendMail({
        from: this.config.from,
        to: message.to,
        replyTo: this.config.replyTo,
        subject: message.subject,

        text: message.text,
        html: message.html,

        headers: {
          'X-Entity-Ref-ID': randomUUID(),
        },
      })

      // sendMail resolves even when the server accepted the envelope but
      // rejected this recipient — treat that as a failure.
      // `rejected` is Array<string | Address>, so normalise before joining.
      const rejected = (info.rejected ?? []).map((entry) =>
        typeof entry === 'string' ? entry : entry.address
      )

      if (rejected.length > 0) {
        throw new Error(`Gmail rejected recipient(s): ${rejected.join(', ')}`)
      }
    } catch (error) {
      // A revoked/expired refresh token fails as a generic auth error. Drop the
      // cached transporter so the next attempt rebuilds and re-fetches a token
      // instead of reusing a transporter pinned to dead credentials.
      cachedTransporter = null

      const reason =
        error instanceof Error ? error.message : 'Unknown SMTP error'

      if (/invalid_grant|unauthorized_client|invalid_client/i.test(reason)) {
        throw new Error(
          `Gmail OAuth2 credentials rejected (${reason}). ` +
            'The refresh token is likely expired or revoked — check that the ' +
            'OAuth consent screen is published to production.'
        )
      }

      throw error
    }
  }
}

/** Dev/CI fallback so missing credentials never break the flow. */
export class NoopEmailService implements IEmailService {
  async send(message: EmailMessage): Promise<void> {
    console.info('[NoopEmailService] e-mail suppressed', {
      to: message.to,
      subject: message.subject,
    })
  }
}

export function createEmailService(): IEmailService {
  const config = readGmailConfig()

  if (!config) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(
        '[createEmailService] GMAIL_USER / GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / ' +
          'GOOGLE_REFRESH_TOKEN missing in production — falling back to no-op.'
      )
    }
    return new NoopEmailService()
  }

  return new NodemailerEmailService(config)
}
