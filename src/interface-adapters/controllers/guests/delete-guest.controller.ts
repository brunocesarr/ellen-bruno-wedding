import { deleteGuestUseCase } from '@/src/application/use-cases/guests/delete-guest.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function deleteGuestController(id: string) {
  return handle(async () => {
    const c = await getContainer()
    return await deleteGuestUseCase({
      guestsRepo: c.guestsRepo,
      authService: c.authService,
    })(id)
  })
}
