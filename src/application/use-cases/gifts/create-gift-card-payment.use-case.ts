import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import type { ICardPaymentService } from '@/src/application/services/card-payment.service.interface'
import { ValidationError } from '@/src/entities/errors/common'
import {
  GiftAlreadyReservedError,
  GiftAmountRequiredError,
  GiftAmountTooLowError,
  GiftNotFoundError,
} from '@/src/entities/errors/gifts'
import { CreateCardPaymentInputSchema } from '@/src/entities/models/pix'
import { randomUUID } from 'crypto'
import { z } from 'zod'

type Deps = {
  giftsRepo: IGiftsRepository
  cardPaymentService: ICardPaymentService
}

/**
 * Creates a Mercado Pago Checkout Pro preference and returns the URL to
 * redirect the guest to. Nothing is written to the DB here — unlike PIX,
 * a card payment is only ever recorded once the webhook confirms it (see
 * confirmCardPaymentUseCase), so an abandoned checkout leaves no trace.
 */
export function createGiftCardPaymentUseCase(d: Deps) {
  return async (raw: unknown): Promise<{ checkoutUrl: string }> => {
    const parsed = CreateCardPaymentInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    const { giftId, name, message, amount } = parsed.data

    const gift = await d.giftsRepo.getById(giftId)
    if (!gift) throw new GiftNotFoundError()

    // Funds never lock; fixed_item/open_item accept exactly one payer.
    if (gift.kind !== 'fund' && gift.isReserved) {
      throw new GiftAlreadyReservedError()
    }

    let chargeAmount: number
    if (gift.kind === 'fixed_item') {
      chargeAmount = gift.price ?? 0
    } else {
      if (amount == null) throw new GiftAmountRequiredError()
      if (gift.minAmount != null && amount < gift.minAmount) {
        throw new GiftAmountTooLowError(gift.minAmount)
      }
      chargeAmount = amount
    }

    const contributionId = randomUUID()

    return d.cardPaymentService.createPreference({
      giftId: gift.id,
      amount: chargeAmount,
      description: `Presente: ${gift.name}`,
      contributionId,
      guestName: name,
      message,
    })
  }
}
