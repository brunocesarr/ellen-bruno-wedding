import type {
  CardPayment,
  CreateCardPreferenceInput,
  ICardPaymentService,
  VerifyWebhookSignatureInput,
} from '@/src/application/services/card-payment.service.interface'
import { createHash, timingSafeEqual } from 'crypto'

export type PagBankServiceConfig = {
  token: string
  environment: 'sandbox' | 'production'
  siteUrl: string
}

const BASE_URLS = {
  sandbox: 'https://sandbox.api.pagseguro.com',
  production: 'https://api.pagseguro.com',
} as const

// PagBank's Checkout API charges in cents; every amount in this codebase is
// reais with 2 decimal places (see AGENTS.md's money-handling note) — round,
// don't truncate, to avoid float artifacts like 150.1 * 100 === 15009.999…
function toCents(amount: number): number {
  return Math.round(amount * 100)
}

function fromCents(cents: number): number {
  return cents / 100
}

/**
 * Charge statuses per PagBank's Orders/Checkout docs: AUTHORIZED, PAID,
 * IN_ANALYSIS, DECLINED, CANCELED, WAITING. Normalized to Mercado Pago's
 * 'approved' vocabulary so confirmCardPaymentUseCase's
 * `payment.status !== 'approved'` check keeps working unmodified across
 * both providers — see ICardPaymentService.
 */
function normalizeStatus(pagbankStatus: string | undefined): string {
  return pagbankStatus === 'PAID' ? 'approved' : (pagbankStatus ?? 'unknown')
}

export class PagBankService implements ICardPaymentService {
  private readonly token: string
  private readonly baseUrl: string
  private readonly notificationUrl: string
  private readonly redirectUrl: string

  constructor(config?: Partial<PagBankServiceConfig>) {
    const token = config?.token ?? process.env.PAGBANK_TOKEN ?? ''
    if (!token) {
      throw new Error('Pagamento por cartão indisponível no momento.')
    }

    // Defaults to sandbox — flipping to production is a deliberate opt-in,
    // not something a missing env var should do silently.
    const environment =
      config?.environment ??
      (process.env.PAGBANK_ENVIRONMENT as
        'sandbox' | 'production' | undefined) ??
      'sandbox'

    const siteUrl =
      config?.siteUrl ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'https://ellen-bruno-wedding.netlify.app'

    this.token = token
    this.baseUrl = BASE_URLS[environment]
    this.notificationUrl = `${siteUrl}/api/pagbank/webhook`
    this.redirectUrl = `${siteUrl}/presentes`
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(
        `PagBank ${init?.method ?? 'GET'} ${path} failed: ${response.status} ${body}`
      )
    }

    return response.json() as Promise<T>
  }

  async createPreference(
    input: CreateCardPreferenceInput
  ): Promise<{ checkoutUrl: string }> {
    // TODO(pagbank): the Checkout API has no documented free-form metadata
    // field the way Mercado Pago's `metadata` echoes back on Payment.get().
    // `reference_id` mirrors MP's `external_reference` (contributionId) and
    // `items[0].reference_id` carries giftId, but `input.message` has no
    // slot to round-trip through — it will come back as null from
    // getPayment() until that's solved (e.g. a short-lived pending-payment
    // record keyed by contributionId, written here and read in getPayment).
    // Verify all of this against a real sandbox response before wiring this
    // service into the webhook route — the shapes below are inferred from
    // PagBank's docs, not confirmed against actual API output.
    const result = await this.request<{
      links?: { rel: string; href: string }[]
    }>('/checkouts', {
      method: 'POST',
      body: JSON.stringify({
        reference_id: input.contributionId,
        customer: {
          name: input.guestName,
          email: input.guestEmail,
        },
        customer_modifiable: false,
        items: [
          {
            reference_id: input.giftId,
            name: input.description,
            quantity: 1,
            unit_amount: toCents(input.amount),
          },
        ],
        // Card only — PIX already has its own in-app flow, no need to
        // duplicate it on PagBank's hosted page.
        payment_methods: [{ type: 'CREDIT_CARD' }, { type: 'DEBIT_CARD' }],
        redirect_url: this.redirectUrl,
        notification_urls: [this.notificationUrl],
      }),
    })

    const checkoutUrl = result.links?.find((link) => link.rel === 'PAY')?.href
    if (!checkoutUrl) {
      throw new Error('PagBank não retornou uma URL de pagamento.')
    }

    return { checkoutUrl }
  }

  async getPayment(paymentId: string): Promise<CardPayment> {
    const result = await this.request<{
      id: string
      reference_id?: string
      customer?: { name?: string }
      items?: { reference_id?: string }[]
      charges?: {
        id: string
        status: string
        amount?: { value?: number }
      }[]
    }>(`/checkouts/${paymentId}`)

    // Docs don't confirm whether a checkout with no completed attempt yet
    // returns an empty `charges` array or omits the field — guard both.
    const charge = result.charges?.at(-1)
    if (!charge) {
      console.error('[pagbank] checkout has no charges yet', { paymentId })
    }

    return {
      // Deliberately the checkout id (== paymentId passed in), not the
      // charge sub-resource's own id: confirmCardPaymentUseCase's
      // idempotency pre-check compares the id it was invoked with against
      // whatever gets stored here, so this must stay self-consistent with
      // the argument above rather than switch identifiers mid-flow.
      id: result.id,
      status: normalizeStatus(charge?.status),
      transactionAmount: fromCents(charge?.amount?.value ?? 0),
      externalReference: result.reference_id ?? null,
      giftId: result.items?.[0]?.reference_id ?? null,
      guestName: result.customer?.name ?? null,
      message: null,
    }
  }

  verifyWebhookSignature(input: VerifyWebhookSignatureInput): void {
    if (input.rawBody === undefined) {
      throw new Error('PagBank webhook verification requires the raw body.')
    }

    // PagBank's own scheme: SHA-256("${accountToken}-${rawBody}"), compared
    // against the `x-authenticity-token` header. The payload must be hashed
    // exactly as received — do not JSON.parse then re-stringify it upstream.
    const expected = createHash('sha256')
      .update(`${this.token}-${input.rawBody}`)
      .digest('hex')

    const received = input.signature ?? ''
    const expectedBuf = Buffer.from(expected, 'hex')
    const receivedBuf = Buffer.from(received, 'hex')

    if (
      expectedBuf.length !== receivedBuf.length ||
      !timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      throw new Error('Assinatura do webhook PagBank inválida.')
    }
  }
}
