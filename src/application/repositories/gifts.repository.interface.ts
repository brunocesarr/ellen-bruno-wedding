import type {
  CreateGiftInput,
  Gift,
  UpdateGiftInput,
} from '@/src/entities/models/gift'

export type ReserveGiftParams = {
  id: string
  name: string
  message?: string
  amount?: number
  contributionId: string
}

export type ReserveGiftResult = { gift: Gift; contributionId: string }

export type ReserveGiftConfirmedParams = {
  id: string
  name: string
  message?: string
  amount: number
  contributionId: string
  paymentMethod: 'card'
} & (
  | { paymentProvider: 'mercado_pago'; mpPaymentId: string }
  | { paymentProvider: 'pagbank'; pagbankPaymentId: string }
)

export interface IGiftsRepository {
  list(): Promise<Gift[]>
  getById(id: string): Promise<Gift | null>
  reserve(params: ReserveGiftParams): Promise<ReserveGiftResult>
  /**
   * Atomically reserves the gift + inserts an already-confirmed ledger row.
   * Backed by a separate, service_role-only RPC (`reserve_gift_paid`) — never
   * extend `reserve()`/`reserve_gift` with a "confirmed" flag, since that
   * function is anon-callable and grants aren't per-argument-value.
   */
  reserveConfirmed(
    params: ReserveGiftConfirmedParams
  ): Promise<ReserveGiftResult>
  create(data: CreateGiftInput): Promise<Gift>
  update(data: UpdateGiftInput): Promise<Gift>
  delete(id: string): Promise<void>
  /**
   * Admin-only: directly flips is_reserved without the reserve_gift RPC or a
   * pix_confirmations ledger row. For gifts paid through an external
   * payment_link, where no webhook ever confirms the payment — the admin is
   * the one reconciling it after seeing the payment land elsewhere.
   */
  markReservedManually(params: {
    id: string
    reservedByName: string
  }): Promise<Gift>
  /** Best-effort view counter for the public gift detail page. */
  incrementView(id: string): Promise<void>
}
