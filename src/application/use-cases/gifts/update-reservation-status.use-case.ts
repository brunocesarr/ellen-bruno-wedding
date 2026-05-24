import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import type { IPixConfirmationsRepository } from '@/src/application/repositories/pix-confirmations.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { GiftNotFoundError } from '@/src/entities/errors/gifts'
import type { ReservationStatus } from '@/src/entities/models/dashboard'
import { PixConfirmationInputSchema } from '@/src/entities/models/pix'

type Deps = {
  giftsRepo: IGiftsRepository
  pixRepo: IPixConfirmationsRepository
  authService: IAuthService
}

export function updateReservationStatusUseCase(d: Deps) {
  return async (giftId: string, status: ReservationStatus) => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()

    const gift = await d.giftsRepo.getById(giftId)
    if (!gift) throw new GiftNotFoundError()

    switch (status) {
      case 'pending': {
        await d.pixRepo.deleteByGiftId(giftId)
        return d.giftsRepo.clearReservation(giftId)
      }

      case 'reserved': {
        const existing = await d.pixRepo.listByGiftId(giftId)
        await Promise.all(
          existing
            .filter((p) => p.confirmed)
            .map((p) => d.pixRepo.update(p.id, { confirmed: false }))
        )
        return gift
      }

      case 'thanked': {
        const existing = await d.pixRepo.listByGiftId(giftId)
        let item = existing[0]
        if (item) {
          await d.pixRepo.update(item.id, { confirmed: true })
        } else {
          const parsed = PixConfirmationInputSchema.parse({
            giftId,
            guestName: gift.reservedByName ?? 'Convidado(a)',
            amount: gift.price,
          })
          await d.pixRepo.create({ ...parsed, confirmed: true })
        }
        return gift
      }
    }
  }
}
