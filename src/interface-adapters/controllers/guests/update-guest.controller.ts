import { updateGuestUseCase } from '@/src/application/use-cases/guests/update-guest.use-case'
import { getPublicContainer } from '@/src/di/public-container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function updateGuestController(input: unknown) {
  return handle(async () => {
    const c = getPublicContainer()
    return await updateGuestUseCase({ guestsRepo: c.guestsRepo })(input)
  })
}
