export type CreateCardPreferenceInput = {
  giftId: string
  amount: number
  description: string
  contributionId: string
  guestName: string
  guestEmail: string
  message?: string
}

export type CardPayment = {
  id: string
  status: string
  transactionAmount: number
  externalReference: string | null
  giftId: string | null
  guestName: string | null
  message: string | null
}

export type VerifyWebhookSignatureInput = {
  /** Mercado Pago's `x-signature` header, or PagBank's `x-authenticity-token`. */
  signature: string | null
  /** Mercado Pago only — the `x-request-id` header. */
  requestId?: string | null
  /** Mercado Pago only — the `data.id` query param. */
  dataId?: string | null
  /**
   * PagBank only — the exact raw request body the signature was computed
   * over. Must be the untouched bytes as received (PagBank hashes
   * `${token}-${rawBody}`); re-serializing a parsed JSON object before
   * hashing produces a different string and every signature will mismatch.
   */
  rawBody?: string
}

export interface ICardPaymentService {
  /** Creates a hosted checkout session and returns its redirect URL. */
  createPreference(
    input: CreateCardPreferenceInput
  ): Promise<{ checkoutUrl: string }>

  /** Re-fetches a payment by id — never trust a webhook body's own fields. */
  getPayment(paymentId: string): Promise<CardPayment>

  /** Throws if the webhook signature doesn't match. */
  verifyWebhookSignature(input: VerifyWebhookSignatureInput): void
}
