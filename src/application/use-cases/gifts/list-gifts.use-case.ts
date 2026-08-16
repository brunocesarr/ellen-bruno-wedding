import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import type { IPixConfirmationsRepository } from '@/src/application/repositories/pix-confirmations.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import type {
  GiftWithStatus,
  ReservationStatus,
} from '@/src/entities/models/dashboard'

type Deps = {
  giftsRepo: IGiftsRepository
  pixRepo: IPixConfirmationsRepository // no longer read here; safe to drop
  authService: IAuthService
}

export function listGiftsUseCase(d: Deps) {
  return async (): Promise<GiftWithStatus[]> => {
    const gifts = await d.giftsRepo.list()

    return gifts.map((g) => {
      let status: ReservationStatus = 'pending'

      if (g.kind === 'fund') {
        status = g.confirmedTotal > 0 ? 'thanked' : 'pending'
      } else if (g.isReserved) {
        status = g.confirmedTotal > 0 ? 'thanked' : 'reserved'
      }

      return { ...g, status }
    })
  }
}
