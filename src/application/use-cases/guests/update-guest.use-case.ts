import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { UpdateGuestInputSchema } from '@/src/entities/models/guest'
import { z } from 'zod'

export function updateGuestUseCase(deps: { guestsRepo: IGuestsRepository }) {
  return async (raw: unknown) => {
    const parsed = UpdateGuestInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))
    return deps.guestsRepo.update(parsed.data)
  }
}
