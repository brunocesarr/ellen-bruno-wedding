import { decideRsvpRequestUseCase } from '@/src/application/use-cases/rsvp-requests/decide-rsvp-request.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function decideRsvpRequestController(input: unknown) {
  return handle(async () => {
    const c = await getContainer()
    return await decideRsvpRequestUseCase({
      authService: c.authService,
      rsvpRequestsRepo: c.rsvpRequestsRepo,
      emailService: c.emailService,
    })(input)
  })
}
