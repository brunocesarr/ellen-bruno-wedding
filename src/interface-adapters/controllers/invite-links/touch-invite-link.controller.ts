import { touchInviteLinkUseCase } from '@/src/application/use-cases/invite-links/touch-invite-link.use-case'
import { getPublicContainer } from '@/src/di/public-container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function touchInviteLinkController(token: unknown) {
  return handle(async () => {
    const c = getPublicContainer()
    return await touchInviteLinkUseCase({
      inviteLinksRepo: c.inviteLinksRepo,
    })(token)
  })
}
