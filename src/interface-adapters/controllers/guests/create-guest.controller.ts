import { createGuestUseCase } from '@/src/application/use-cases/guests/create-guest.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function createGuestController(input: unknown) {
  return handle(async () => {
    const c = await getContainer()
    return await createGuestUseCase({
      guestsRepo: c.guestsRepo,
      authService: c.authService,
    })(input)
  })
}
