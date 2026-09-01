import type { ICardPaymentService } from '@/src/application/services/card-payment.service.interface'
import { MercadoPagoService } from '@/src/infrastructure/services/mercado-pago.service'
import { PagBankService } from '@/src/infrastructure/services/pagbank.service'
import { MIN_CARD_PAYMENT_AMOUNT } from '@/src/lib/constants'

export type CardPaymentProvider = 'mercado_pago' | 'pagbank'

export const CARD_PAYMENT_PROVIDER_LABELS: Record<CardPaymentProvider, string> =
  {
    mercado_pago: 'Mercado Pago',
    pagbank: 'PagBank',
  }

/**
 * Which provider new checkouts are created with. Defaults to Mercado Pago —
 * flipping to PagBank is a deliberate opt-in once its sandbox flow has been
 * verified end-to-end, not something a missing/typo'd env var should do.
 * Both providers' webhook routes stay live regardless of this flag, since a
 * checkout already created under the other provider still needs its webhook
 * processed.
 */
export function getActiveCardPaymentProvider(): CardPaymentProvider {
  return process.env.CARD_PAYMENT_PROVIDER === 'pagbank'
    ? 'pagbank'
    : 'mercado_pago'
}

/**
 * Constructed here, not in getContainer(): both services' constructors throw
 * if their provider isn't configured, and getContainer() is shared by every
 * controller/page — that would break unrelated requests.
 */
export function getCardPaymentService(): ICardPaymentService {
  return getActiveCardPaymentProvider() === 'pagbank'
    ? new PagBankService()
    : new MercadoPagoService()
}

export { MIN_CARD_PAYMENT_AMOUNT }

/**
 * Card payment is opt-in and gated behind a minimum amount — small charges
 * eat disproportionately into processor fees. Both checks are enforced here
 * AND in createGiftCardPaymentUseCase, since the flag/threshold gating the
 * UI must not be bypassable by calling the action directly.
 */
export function isCardPaymentFeatureEnabled(): boolean {
  return process.env.ENABLE_CARD_PAYMENT_TYPE === 'true'
}

export function isCardPaymentAvailable(amount: number | null): boolean {
  return (
    isCardPaymentFeatureEnabled() &&
    amount != null &&
    amount > MIN_CARD_PAYMENT_AMOUNT
  )
}
