import { listGuestsUseCase } from '@/src/application/use-cases/guests/list-guests.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function listGuestsController() {
  return handle(async () => {
    const c = await getContainer()
    return listGuestsUseCase({ guestsRepo: c.guestsRepo })()
  })
}
