import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import { CreateGuestInputSchema } from '@/src/entities/models/guest'
import { z } from 'zod'

export function createGuestUseCase(deps: {
  guestsRepo: IGuestsRepository
  authService: IAuthService
}) {
  return async (raw: unknown) => {
    if (!(await deps.authService.getCurrentUser())) {
      throw new UnauthenticatedError()
    }

    const parsed = CreateGuestInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))
    return deps.guestsRepo.create(parsed.data)
  }
}
