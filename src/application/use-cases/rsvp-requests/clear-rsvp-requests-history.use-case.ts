import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'

/**
 * Permanently deletes every decided (approved/rejected) request — the
 * "Histórico" list on /admin/solicitacoes. Pending requests are untouched;
 * the repository enforces that with a `status <> 'pending'` filter.
 */
export function clearRsvpRequestsHistoryUseCase(deps: {
  authService: IAuthService
  rsvpRequestsRepo: IRsvpRequestsRepository
}) {
  return async (): Promise<{ deletedCount: number }> => {
    const user = await deps.authService.getCurrentUser()
    if (!user) throw new UnauthenticatedError()

    const deletedCount = await deps.rsvpRequestsRepo.deleteDecided()
    return { deletedCount }
  }
}
