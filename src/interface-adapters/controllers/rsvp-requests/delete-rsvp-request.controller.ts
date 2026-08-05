import { deleteRsvpRequestUseCase } from '@/src/application/use-cases/rsvp-requests/delete-rsvp-request.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function deleteRsvpRequestController(input: unknown) {
  return handle(async () => {
    const c = await getContainer()
    return await deleteRsvpRequestUseCase({
      authService: c.authService,
      rsvpRequestsRepo: c.rsvpRequestsRepo,
    })(input)
  })
}
