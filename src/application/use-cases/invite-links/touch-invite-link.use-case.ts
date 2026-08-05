import type { IInviteLinksRepository } from '@/src/application/repositories/invite-links.repository.interface'
import { InviteTokenSchema } from '@/src/entities/models/invite-link'

/**
 * Best-effort visit counter, scheduled with `after()` so it never sits in the
 * render path. Swallows everything: an analytics blip must not break a guest's
 * invitation.
 *
 * Caveat: /invite/full is cached (revalidate = 60), so this fires on cache miss
 * only. Treat the counter as "was this link ever opened?", not a precise total.
 */
export function touchInviteLinkUseCase(deps: {
  inviteLinksRepo: IInviteLinksRepository
}) {
  return async (raw: unknown): Promise<void> => {
    const parsed = InviteTokenSchema.safeParse(raw)
    if (!parsed.success) return

    try {
      await deps.inviteLinksRepo.touch(parsed.data)
    } catch (error) {
      console.error('[touchInviteLink] visit counter failed', error)
    }
  }
}
