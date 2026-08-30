import { resetAllGuestsToPendingUseCase } from '@/src/application/use-cases/guests/reset-all-guests-to-pending.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function resetAllGuestsToPendingController() {
  return handle(async () => {
    const c = await getContainer()
    return resetAllGuestsToPendingUseCase({ guestsRepo: c.guestsRepo })()
  })
}
