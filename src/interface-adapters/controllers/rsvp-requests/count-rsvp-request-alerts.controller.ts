import { countRsvpRequestAlertsUseCase } from '@/src/application/use-cases/rsvp-requests/count-rsvp-request-alerts.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function countRsvpRequestAlertsController() {
  return handle(async () => {
    const c = await getContainer()
    return await countRsvpRequestAlertsUseCase({
      authService: c.authService,
      rsvpRequestsRepo: c.rsvpRequestsRepo,
    })()
  })
}
