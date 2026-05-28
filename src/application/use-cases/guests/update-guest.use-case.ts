import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { UpdateGuestInputSchema } from '@/src/entities/models/guest'

export const updateGuestUseCase =
  (deps: { guestsRepo: IGuestsRepository }) => async (raw: unknown) => {
    const parsed = UpdateGuestInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(parsed.error.issues)
    return deps.guestsRepo.update(parsed.data)
  }
