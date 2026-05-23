import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import { GiftNotFoundError } from '@/src/entities/errors/gifts'

export function getGiftUseCase(deps: { giftsRepo: IGiftsRepository }) {
  return async (id: string) => {
    const gift = await deps.giftsRepo.getById(id)
    if (!gift) throw new GiftNotFoundError()
    return gift
  }
}
