import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import type { IPixConfirmationsRepository } from '@/src/application/repositories/pix-confirmations.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { GiftNotFoundError } from '@/src/entities/errors/gifts'
import { PixConfirmationInputSchema } from '@/src/entities/models/pix'

type Deps = {
  giftsRepo: IGiftsRepository
  pixRepo: IPixConfirmationsRepository
  authService: IAuthService
}

export function markAsThankedUseCase(d: Deps) {
  return async (giftId: string) => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()

    const gift = await d.giftsRepo.getById(giftId)
    if (!gift) throw new GiftNotFoundError()

    const existing = await d.pixRepo.listByGiftId(giftId)

    if (existing.length > 0) {
      const item = existing[0]
      if (!item) throw new GiftNotFoundError()
      return d.pixRepo.update(item.id, { confirmed: true })
    }

    const parsed = PixConfirmationInputSchema.parse({
      giftId,
      guestName: gift.reservedByName ?? 'Convidado(a)',
      amount: gift.price,
    })

    return d.pixRepo.create({ ...parsed, confirmed: true })
  }
}
