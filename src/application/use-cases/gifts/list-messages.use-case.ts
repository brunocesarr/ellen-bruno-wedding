import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import type { IPixConfirmationsRepository } from '@/src/application/repositories/pix-confirmations.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import type { Gift } from '@/src/entities/models/gift'

export type MessageWithGift = {
  giftId: string
  guestName: string
  message: string
  thanked: boolean
  createdAt: Date
  gift: Pick<Gift, 'name' | 'price' | 'imagePath'>
}

type Deps = {
  giftsRepo: IGiftsRepository
  pixRepo: IPixConfirmationsRepository
  authService: IAuthService
}

export function listMessagesUseCase(d: Deps) {
  return async (): Promise<MessageWithGift[]> => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()

    const [gifts, pixList] = await Promise.all([
      d.giftsRepo.list(),
      d.pixRepo.list(),
    ])
    const confirmedByGift = new Set(
      pixList.filter((p) => p.confirmed).map((p) => p.giftId)
    )

    return gifts
      .filter((g) => !!g.reservedMessage)
      .sort(
        (a, b) =>
          (b.reservedAt?.getTime() ?? 0) - (a.reservedAt?.getTime() ?? 0)
      )
      .map((g) => ({
        giftId: g.id,
        guestName: g.reservedByName ?? 'Convidado(a)',
        message: g.reservedMessage ?? '',
        thanked: confirmedByGift.has(g.id),
        createdAt: g.reservedAt ?? new Date(),
        gift: { name: g.name, price: g.price, imagePath: g.imagePath },
      }))
  }
}
