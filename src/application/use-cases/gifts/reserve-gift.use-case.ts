import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { ReserveGiftInputSchema } from '@/src/entities/models/gift'
import { randomUUID } from 'crypto'
import { z } from 'zod'

export function reserveGiftUseCase(deps: { giftsRepo: IGiftsRepository }) {
  return async (raw: unknown) => {
    const result = ReserveGiftInputSchema.safeParse(raw)
    if (!result.success) throw new ValidationError(z.flattenError(result.error))

    return deps.giftsRepo.reserve({
      id: result.data.giftId,
      name: result.data.name,
      message: result.data.message,
      amount: result.data.amount,
      contributionId: randomUUID(),
    })
  }
}
