import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import type { IEmailService } from '@/src/application/services/email.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import {
  RsvpDecisionEmailFailedError,
  RsvpRequestAlreadyDecidedError,
  RsvpRequestNotFoundError,
} from '@/src/entities/errors/rsvp-requests'
import { DecideRsvpRequestInputSchema } from '@/src/entities/models/rsvp-request'
import { buildRsvpDecisionEmail } from '@/src/lib/email-templates'
import { z } from 'zod'

/**
 * The decision is applied ONLY if the notification e-mail is delivered.
 *
 * Postgres and SMTP cannot share a transaction, so we choose the least
 * damaging failure mode: send first, commit second.
 *
 *   - e-mail fails  -> nothing is written; request stays pending; safe retry.
 *   - commit fails  -> guest already received the e-mail and a retry will send
 *                      a duplicate. Acceptable: a repeated friendly message is
 *                      far cheaper than a guest list that disagrees with what
 *                      the guest was told.
 *
 * This is viable because the e-mail body depends only on data known before the
 * write (fullName, email, attending, intended status).
 */
export function decideRsvpRequestUseCase(deps: {
  authService: IAuthService
  rsvpRequestsRepo: IRsvpRequestsRepository
  emailService: IEmailService
}) {
  return async (raw: unknown) => {
    const user = await deps.authService.getCurrentUser()
    if (!user) throw new UnauthenticatedError()

    const parsed = DecideRsvpRequestInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    const { id, decision } = parsed.data

    const current = await deps.rsvpRequestsRepo.findById(id)
    if (!current) throw new RsvpRequestNotFoundError()
    if (current.status !== 'pending') throw new RsvpRequestAlreadyDecidedError()

    // --- 1. Notify first. A failure here aborts before any write. -----------
    const projected = { ...current, status: decision, decidedAt: new Date() }

    try {
      await deps.emailService.send(buildRsvpDecisionEmail(projected))
    } catch (error) {
      console.error(
        '[decideRsvpRequest] e-mail failed — decision NOT applied',
        {
          requestId: id,
          decision,
          error,
        }
      )
      throw new RsvpDecisionEmailFailedError(
        error instanceof Error ? error.message : undefined
      )
    }

    // --- 2. Commit only after the guest has been told. ----------------------
    return decision === 'approved'
      ? deps.rsvpRequestsRepo.approve(id)
      : deps.rsvpRequestsRepo.reject(id)
  }
}
