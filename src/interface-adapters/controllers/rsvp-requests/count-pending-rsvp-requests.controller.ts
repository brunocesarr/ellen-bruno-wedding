import { countPendingRsvpRequestsUseCase } from '@/src/application/use-cases/rsvp-requests/count-pending-rsvp-requests.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function countPendingRsvpRequestsController() {
  return handle(async () => {
    const c = await getContainer()
    return await countPendingRsvpRequestsUseCase({
      authService: c.authService,
      rsvpRequestsRepo: c.rsvpRequestsRepo,
    })()
  })
}
