import type {
  PixConfirmation,
  PixConfirmationInput,
} from '@/src/entities/models/pix'

export interface IPixConfirmationsRepository {
  list(): Promise<PixConfirmation[]>
  listByGiftId(giftId: string): Promise<PixConfirmation[]>
  /** For webhook idempotency: is this Mercado Pago payment already recorded? */
  findByMpPaymentId(mpPaymentId: string): Promise<PixConfirmation | null>
  /** For webhook idempotency: is this PagBank payment already recorded? */
  findByPagbankPaymentId(
    pagbankPaymentId: string
  ): Promise<PixConfirmation | null>

  create(
    input: PixConfirmationInput & {
      confirmed?: boolean
      paymentMethod?: 'pix' | 'card'
      paymentProvider?: 'mercado_pago' | 'pagbank'
      mpPaymentId?: string
      pagbankPaymentId?: string
    }
  ): Promise<PixConfirmation>

  update(
    id: string,
    patch: Partial<{ confirmed: boolean }>
  ): Promise<PixConfirmation>

  deleteByGiftId(giftId: string): Promise<void>
}
