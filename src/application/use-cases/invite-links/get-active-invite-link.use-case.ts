import type { IInviteLinksRepository } from '@/src/application/repositories/invite-links.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'

export function getActiveInviteLinkUseCase(deps: {
  authService: IAuthService
  inviteLinksRepo: IInviteLinksRepository
}) {
  return async () => {
    const user = await deps.authService.getCurrentUser()
    if (!user) throw new UnauthenticatedError()

    return deps.inviteLinksRepo.findActive()
  }
}
