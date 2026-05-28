import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { CreateGuestInputSchema } from '@/src/entities/models/guest'

export const createGuestUseCase =
  (deps: { guestsRepo: IGuestsRepository }) => async (raw: unknown) => {
    const parsed = CreateGuestInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(parsed.error.issues)
    return deps.guestsRepo.create(parsed.data)
  }
