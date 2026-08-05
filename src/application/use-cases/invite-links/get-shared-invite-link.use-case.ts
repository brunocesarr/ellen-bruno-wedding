import type { IInviteLinksRepository } from '@/src/application/repositories/invite-links.repository.interface'
import { InviteLinkNotFoundError } from '@/src/entities/errors/invite-links'
import { InviteTokenSchema } from '@/src/entities/models/invite-link'

/**
 * Public, unauthenticated. Resolves a generic shareable token.
 *
 * Deliberately returns the same error for "unknown", "revoked" and "malformed"
 * so a caller cannot probe which tokens ever existed.
 */
export function getSharedInviteLinkUseCase(deps: {
  inviteLinksRepo: IInviteLinksRepository
}) {
  return async (raw: unknown) => {
    const parsed = InviteTokenSchema.safeParse(raw)
    if (!parsed.success) throw new InviteLinkNotFoundError()

    const link = await deps.inviteLinksRepo.findActiveByToken(parsed.data)
    if (!link) throw new InviteLinkNotFoundError()

    return link
  }
}
