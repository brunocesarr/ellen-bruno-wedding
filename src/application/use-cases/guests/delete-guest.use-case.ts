import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'

export const deleteGuestUseCase =
  (deps: { guestsRepo: IGuestsRepository }) => (id: string) =>
    deps.guestsRepo.delete(id)
