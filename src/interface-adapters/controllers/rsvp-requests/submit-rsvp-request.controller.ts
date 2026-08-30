import { submitRsvpRequestUseCase } from '@/src/application/use-cases/rsvp-requests/submit-rsvp-request.use-case'
import { getPublicContainer } from '@/src/di/public-container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function submitRsvpRequestController(input: unknown) {
  return handle(async () => {
    const c = getPublicContainer()
    return await submitRsvpRequestUseCase({
      rsvpRequestsRepo: c.rsvpRequestsRepo,
      guestsRepo: c.guestsRepo,
      emailService: c.emailService,
    })(input)
  })
}
