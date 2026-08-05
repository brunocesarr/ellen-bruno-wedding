import { resendRsvpDecisionEmailUseCase } from '@/src/application/use-cases/rsvp-requests/resend-rsvp-decision-email.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function resendRsvpDecisionEmailController(input: unknown) {
  return handle(async () => {
    const c = await getContainer()
    return await resendRsvpDecisionEmailUseCase({
      authService: c.authService,
      rsvpRequestsRepo: c.rsvpRequestsRepo,
      emailService: c.emailService,
    })(input)
  })
}
