import { assignGuestPartyUseCase } from '@/src/application/use-cases/guests/assign-guest-party.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function assignGuestPartyController(input: unknown) {
  return handle(async () => {
    const c = await getContainer()
    return await assignGuestPartyUseCase({
      guestsRepo: c.guestsRepo,
      authService: c.authService,
    })(input)
  })
}
