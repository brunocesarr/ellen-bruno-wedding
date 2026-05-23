import type { IRsvpRepository } from '@/src/application/repositories/rsvp.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'

export function listRsvpsUseCase(deps: {
  rsvpRepo: IRsvpRepository
  authService: IAuthService
}) {
  return async () => {
    const user = await deps.authService.getCurrentUser()
    if (!user) throw new UnauthenticatedError()
    return deps.rsvpRepo.list()
  }
}
