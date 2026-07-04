import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { CreateGuestInputSchema } from '@/src/entities/models/guest'
import { z } from 'zod'

export function createGuestUseCase(deps: { guestsRepo: IGuestsRepository }) {
  return async (raw: unknown) => {
    const parsed = CreateGuestInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))
    return deps.guestsRepo.create(parsed.data)
  }
}
