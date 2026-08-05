import { listRsvpRequestsUseCase } from '@/src/application/use-cases/rsvp-requests/list-rsvp-requests.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function listRsvpRequestsController(input: unknown = {}) {
  return handle(async () => {
    const c = await getContainer()
    return await listRsvpRequestsUseCase({
      authService: c.authService,
      rsvpRequestsRepo: c.rsvpRequestsRepo,
    })(input)
  })
}
