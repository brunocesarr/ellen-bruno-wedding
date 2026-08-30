import { renameGuestNamesUseCase } from '@/src/application/use-cases/guests/rename-guest-names.use-case'
import { getPublicContainer } from '@/src/di/public-container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function renameGuestNamesController(input: unknown) {
  return handle(async () => {
    const c = getPublicContainer()
    return await renameGuestNamesUseCase({ guestsRepo: c.guestsRepo })(input)
  })
}
