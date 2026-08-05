import { createInviteLinkUseCase } from '@/src/application/use-cases/invite-links/create-invite-link.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function createInviteLinkController(input: unknown = {}) {
  return handle(async () => {
    const c = await getContainer()
    return await createInviteLinkUseCase({
      authService: c.authService,
      inviteLinksRepo: c.inviteLinksRepo,
    })(input)
  })
}
