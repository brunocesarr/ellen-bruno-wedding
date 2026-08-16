import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import type { IPixService } from '@/src/application/services/pix.service.interface'
import { ValidationError } from '@/src/entities/errors/common'
import {
  GiftAlreadyReservedError,
  GiftAmountTooLowError,
  GiftNotFoundError,
} from '@/src/entities/errors/gifts'
import { GeneratePixInputSchema } from '@/src/entities/models/pix'
import { z } from 'zod'

type Deps = { giftsRepo: IGiftsRepository; pixService: IPixService }

/**
 * Builds a PIX QR for a guest-chosen amount. Mirrors the reserve_gift RPC's
 * amount rules so the guest is told "below the minimum" before paying rather
 * than after. The RPC remains the authority at reservation time.
 */
export function generateGiftPixUseCase(d: Deps) {
  return async (raw: unknown) => {
    const parsed = GeneratePixInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    const gift = await d.giftsRepo.getById(parsed.data.giftId)
    if (!gift) throw new GiftNotFoundError()

    // fixed_item QRs are generated at render time from the gift's own price.
    if (gift.kind === 'fixed_item') {
      throw new Error('Este presente tem valor fixo.')
    }

    // Funds never lock; an open_item accepts exactly one buyer.
    if (gift.kind === 'open_item' && gift.isReserved) {
      throw new GiftAlreadyReservedError()
    }

    if (gift.minAmount != null && parsed.data.amount < gift.minAmount) {
      throw new GiftAmountTooLowError(gift.minAmount)
    }

    return d.pixService.generateStaticQr({
      amount: parsed.data.amount,
      description: `Presente: ${gift.name}`,
    })
  }
}
