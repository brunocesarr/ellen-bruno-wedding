import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import type { RsvpRequestAlerts } from '@/src/entities/models/rsvp-request'

/**
 * Two head-only counts for the sidebar badge. A decided-but-unnotified request
 * is just as actionable as an undecided one — the guest still doesn't know.
 */
export function countRsvpRequestAlertsUseCase(deps: {
  authService: IAuthService
  rsvpRequestsRepo: IRsvpRequestsRepository
}) {
  return async (): Promise<RsvpRequestAlerts> => {
    const user = await deps.authService.getCurrentUser()
    if (!user) throw new UnauthenticatedError()

    const [pending, unnotified] = await Promise.all([
      deps.rsvpRequestsRepo.countPending(),
      deps.rsvpRequestsRepo.countUnnotified(),
    ])

    return { pending, unnotified }
  }
}
