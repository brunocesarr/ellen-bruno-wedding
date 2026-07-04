import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'

export function listGuestsUseCase(deps: { guestsRepo: IGuestsRepository }) {
  return () => deps.guestsRepo.list()
}
