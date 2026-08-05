import { getSharedInviteLinkUseCase } from '@/src/application/use-cases/invite-links/get-shared-invite-link.use-case'
import { getPublicContainer } from '@/src/di/public-container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function getSharedInviteLinkController(token: unknown) {
  return handle(async () => {
    const c = getPublicContainer()
    return await getSharedInviteLinkUseCase({
      inviteLinksRepo: c.inviteLinksRepo,
    })(token)
  })
}
