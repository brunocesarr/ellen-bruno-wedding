export type CreateCardPreferenceInput = {
  giftId: string
  amount: number
  description: string
  contributionId: string
  guestName: string
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

export interface ICardPaymentService {
  /** Creates a Checkout Pro preference and returns its hosted checkout URL. */
  createPreference(
    input: CreateCardPreferenceInput
  ): Promise<{ checkoutUrl: string }>

  /** Re-fetches a payment by id — never trust a webhook body's own fields. */
  getPayment(paymentId: string): Promise<CardPayment>

  /** Throws if the webhook signature doesn't match. */
  verifyWebhookSignature(input: {
    signature: string | null
    requestId: string | null
    dataId: string | null
  }): void
}
