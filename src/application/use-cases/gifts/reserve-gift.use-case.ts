import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import type { INotificationService } from '@/src/application/services/notification.service.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { ReserveGiftInputSchema } from '@/src/entities/models/gift'
import { buildGiftReservedAlert } from '@/src/lib/notification-templates'
import { randomUUID } from 'crypto'
import { z } from 'zod'

export function reserveGiftUseCase(deps: {
  giftsRepo: IGiftsRepository
  notificationService: INotificationService
}) {
  return async (raw: unknown) => {
    const result = ReserveGiftInputSchema.safeParse(raw)
    if (!result.success) throw new ValidationError(z.flattenError(result.error))

    const reserved = await deps.giftsRepo.reserve({
      id: result.data.giftId,
      name: result.data.name,
      message: result.data.message,
      amount: result.data.amount,
      contributionId: randomUUID(),
    })

    // Best-effort admin alert. Never blocks the reservation.
    try {
      const amount =
        result.data.amount ??
        (reserved.gift.kind === 'fixed_item' ? reserved.gift.price : null)

      await deps.notificationService.send(
        buildGiftReservedAlert({
          gift: reserved.gift,
          buyerName: result.data.name,
          amount,
          buyerMessage: result.data.message,
        })
      )
    } catch (error) {
      console.error('[reserveGift] admin notification FAILED', {
        giftId: result.data.giftId,
        error,
      })
    }

    return reserved
  }
}
