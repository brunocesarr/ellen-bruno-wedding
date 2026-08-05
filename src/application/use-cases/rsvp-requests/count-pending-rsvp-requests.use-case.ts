import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'

export function countPendingRsvpRequestsUseCase(deps: {
  authService: IAuthService
  rsvpRequestsRepo: IRsvpRequestsRepository
}) {
  return async () => {
    const user = await deps.authService.getCurrentUser()
    if (!user) throw new UnauthenticatedError()

    return deps.rsvpRequestsRepo.countPending()
  }
}
