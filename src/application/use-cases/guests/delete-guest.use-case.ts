import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'

export function deleteGuestUseCase(deps: {
  guestsRepo: IGuestsRepository
  authService: IAuthService
}) {
  return async (id: string) => {
    if (!(await deps.authService.getCurrentUser())) {
      throw new UnauthenticatedError()
    }
    return deps.guestsRepo.delete(id)
  }
}
