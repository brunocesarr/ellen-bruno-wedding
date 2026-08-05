import { getActiveInviteLinkUseCase } from '@/src/application/use-cases/invite-links/get-active-invite-link.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function getActiveInviteLinkController() {
  return handle(async () => {
    const c = await getContainer()
    return await getActiveInviteLinkUseCase({
      authService: c.authService,
      inviteLinksRepo: c.inviteLinksRepo,
    })()
  })
}
