import type { IInviteLinksRepository } from '@/src/application/repositories/invite-links.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import { CreateInviteLinkInputSchema } from '@/src/entities/models/invite-link'
import { z } from 'zod'

/**
 * Generates the shareable link. Exactly one link is active at a time, so this
 * revokes any predecessor first — "generate new" doubles as rotation, which is
 * what you want if a link leaks somewhere unintended.
 */
export function createInviteLinkUseCase(deps: {
  authService: IAuthService
  inviteLinksRepo: IInviteLinksRepository
}) {
  return async (raw: unknown = {}) => {
    const user = await deps.authService.getCurrentUser()
    if (!user) throw new UnauthenticatedError()

    const parsed = CreateInviteLinkInputSchema.safeParse(raw ?? {})
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    await deps.inviteLinksRepo.revokeAllActive()

    return deps.inviteLinksRepo.create(parsed.data)
  }
}
