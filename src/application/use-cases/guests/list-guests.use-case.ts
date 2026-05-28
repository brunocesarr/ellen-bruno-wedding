import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'

export const listGuestsUseCase =
  (deps: { guestsRepo: IGuestsRepository }) => () =>
    deps.guestsRepo.list()
