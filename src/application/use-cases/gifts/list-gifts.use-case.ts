import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'

export function listGiftsUseCase(deps: { giftsRepo: IGiftsRepository }) {
  return async () => deps.giftsRepo.list()
}
