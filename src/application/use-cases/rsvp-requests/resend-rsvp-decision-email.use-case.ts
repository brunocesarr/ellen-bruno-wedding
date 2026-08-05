import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import type { IEmailService } from '@/src/application/services/email.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import {
  RsvpDecisionEmailFailedError,
  RsvpRequestNotDecidedError,
  RsvpRequestNotFoundError,
} from '@/src/entities/errors/rsvp-requests'
import { ResendRsvpNotificationInputSchema } from '@/src/entities/models/rsvp-request'
import { buildRsvpDecisionEmail } from '@/src/lib/email-templates'
import { z } from 'zod'

/**
 * Retries the decision notification.
 *
 * Unlike the decide flow, this DOES throw on failure: the admin explicitly
 * asked for an e-mail, so a silent no-op would be misleading.
 *
 * Re-sending an already-notified request is permitted — the guest may have
 * deleted the message. The UI only surfaces the button when notifiedAt is null.
 */
export function resendRsvpDecisionEmailUseCase(deps: {
  authService: IAuthService
  rsvpRequestsRepo: IRsvpRequestsRepository
  emailService: IEmailService
}) {
  return async (raw: unknown) => {
    const user = await deps.authService.getCurrentUser()
    if (!user) throw new UnauthenticatedError()

    const parsed = ResendRsvpNotificationInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    const { id } = parsed.data

    const current = await deps.rsvpRequestsRepo.findById(id)
    if (!current) throw new RsvpRequestNotFoundError()
    if (current.status === 'pending') throw new RsvpRequestNotDecidedError()

    try {
      await deps.emailService.send(buildRsvpDecisionEmail(current))
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : 'Erro desconhecido no envio'

      console.error('[resendRsvpDecisionEmail] send failed', {
        requestId: id,
        error,
      })

      // Record the new failed attempt, then surface the error.
      await deps.rsvpRequestsRepo
        .recordNotification(id, false, reason)
        .catch((e) =>
          console.error('[resendRsvpDecisionEmail] bookkeeping failed', e)
        )

      throw new RsvpDecisionEmailFailedError(reason)
    }

    return deps.rsvpRequestsRepo.recordNotification(id, true, null)
  }
}
