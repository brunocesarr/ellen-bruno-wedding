import { revokeInviteLinksUseCase } from '@/src/application/use-cases/invite-links/revoke-invite-links.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function revokeInviteLinksController() {
  return handle(async () => {
    const c = await getContainer()
    return await revokeInviteLinksUseCase({
      authService: c.authService,
      inviteLinksRepo: c.inviteLinksRepo,
    })()
  })
}
