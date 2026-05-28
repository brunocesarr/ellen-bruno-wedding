import { deleteGuestUseCase } from '@/src/application/use-cases/guests/delete-guest.use-case'
import { getPublicContainer } from '@/src/di/public-container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function deleteGuestController(id: string) {
  return handle(async () => {
    const c = getPublicContainer()
    return await deleteGuestUseCase({ guestsRepo: c.guestsRepo })(id)
  })
}
