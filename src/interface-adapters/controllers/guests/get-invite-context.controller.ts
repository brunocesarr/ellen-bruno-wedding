import { getInviteContextUseCase } from '@/src/application/use-cases/guests/get-invite-context.use-case'
import { getPublicContainer } from '@/src/di/public-container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function getInviteContextController(token: string) {
  return handle(async () => {
    const c = getPublicContainer()
    return await getInviteContextUseCase({ guestsRepo: c.guestsRepo })(token)
  })
}
