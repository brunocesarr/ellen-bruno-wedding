import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'

export function deleteGuestUseCase(deps: { guestsRepo: IGuestsRepository }) {
  return (id: string) => deps.guestsRepo.delete(id)
}
