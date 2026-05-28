import { createGuestUseCase } from '@/src/application/use-cases/guests/create-guest.use-case'
import { getPublicContainer } from '@/src/di/public-container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function createGuestController(input: unknown) {
  return handle(async () => {
    const c = getPublicContainer()
    return await createGuestUseCase({ guestsRepo: c.guestsRepo })(input)
  })
}
