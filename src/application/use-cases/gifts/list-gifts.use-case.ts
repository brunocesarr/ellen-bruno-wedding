import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import type { IPixConfirmationsRepository } from '@/src/application/repositories/pix-confirmations.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import type {
  GiftWithStatus,
  ReservationStatus,
} from '@/src/entities/models/dashboard'

type Deps = {
  giftsRepo: IGiftsRepository
  pixRepo: IPixConfirmationsRepository
  authService: IAuthService
}

export function listGiftsAdminUseCase(d: Deps) {
  return async (): Promise<GiftWithStatus[]> => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()

    const [gifts, pixList] = await Promise.all([
      d.giftsRepo.list(),
      d.pixRepo.list(),
    ])

    // Skip pix entries with no giftId (untied Pix gifts) when deriving per-gift status
    const confirmedByGift = new Set(
      pixList
        .filter((p) => p.confirmed && p.giftId !== null)
        .map((p) => p.giftId as string)
    )

    return gifts.map((g) => {
      let status: ReservationStatus = 'pending'
      if (g.isReserved)
        status = confirmedByGift.has(g.id) ? 'thanked' : 'reserved'
      return { ...g, status }
    })
  }
}
