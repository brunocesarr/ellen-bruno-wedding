import { clearRsvpRequestsHistoryUseCase } from '@/src/application/use-cases/rsvp-requests/clear-rsvp-requests-history.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function clearRsvpRequestsHistoryController() {
  return handle(async () => {
    const c = await getContainer()
    return clearRsvpRequestsHistoryUseCase({
      authService: c.authService,
      rsvpRequestsRepo: c.rsvpRequestsRepo,
    })()
  })
}
