import { updateGuestUseCase } from '@/src/application/use-cases/guests/update-guest.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function updateGuestController(input: unknown) {
  return handle(async () => {
    const c = await getContainer()
    return await updateGuestUseCase({
      guestsRepo: c.guestsRepo,
      authService: c.authService,
    })(input)
  })
}
