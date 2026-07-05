import type {
  PixConfirmation,
  PixConfirmationInput,
} from '@/src/entities/models/pix'

export interface IPixConfirmationsRepository {
  list(): Promise<PixConfirmation[]>
  listByGiftId(giftId: string): Promise<PixConfirmation[]>

  create(
    input: PixConfirmationInput & { confirmed?: boolean }
  ): Promise<PixConfirmation>

  update(
    id: string,
    patch: Partial<{ confirmed: boolean }>
  ): Promise<PixConfirmation>

  deleteByGiftId(giftId: string): Promise<void>
}
