import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import type { IEmailService } from '@/src/application/services/email.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import {
  RsvpRequestAlreadyDecidedError,
  RsvpRequestNotFoundError,
} from '@/src/entities/errors/rsvp-requests'
import {
  DecideRsvpRequestInputSchema,
  type RsvpDecisionResult,
} from '@/src/entities/models/rsvp-request'
import { buildRsvpDecisionEmail } from '@/src/lib/email-templates'
import { z } from 'zod'

/**
 * Commit the decision FIRST, then notify.
 *
 * Postgres and SMTP cannot share a transaction. Rather than gate the decision
 * on delivery, we persist it and record whether the guest was told:
 *
 *   - e-mail ok     -> notified_at set; nothing left to do.
 *   - e-mail fails  -> notified_at stays NULL and notify_error is recorded.
 *                      The admin sees a "needs notification" flag and can retry
 *                      via resendRsvpDecisionEmailUseCase.
 *
 * This never throws for an e-mail problem: `emailSent: false` is a warning the
 * UI surfaces alongside a successful decision.
 */
export function decideRsvpRequestUseCase(deps: {
  authService: IAuthService
  rsvpRequestsRepo: IRsvpRequestsRepository
  emailService: IEmailService
}) {
  return async (raw: unknown): Promise<RsvpDecisionResult> => {
    const user = await deps.authService.getCurrentUser()
    if (!user) throw new UnauthenticatedError()

    const parsed = DecideRsvpRequestInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    const { id, decision } = parsed.data

    const current = await deps.rsvpRequestsRepo.findById(id)
    if (!current) throw new RsvpRequestNotFoundError()
    if (current.status !== 'pending') throw new RsvpRequestAlreadyDecidedError()

    // --- 1. Commit. From here on the decision is final. ---------------------
    const decided =
      decision === 'approved'
        ? await deps.rsvpRequestsRepo.approve(id)
        : await deps.rsvpRequestsRepo.reject(id)

    // --- 2. Notify, tolerating failure. -------------------------------------
    let emailSent = false
    let emailError: string | undefined

    try {
      await deps.emailService.send(buildRsvpDecisionEmail(decided))
      emailSent = true
    } catch (error) {
      emailError =
        error instanceof Error ? error.message : 'Erro desconhecido no envio'
      console.error('[decideRsvpRequest] decision applied, e-mail FAILED', {
        requestId: id,
        decision,
        error,
      })
    }

    // --- 3. Record the outcome. Bookkeeping must not undo step 1. ----------
    let request = decided
    try {
      request = await deps.rsvpRequestsRepo.recordNotification(
        id,
        emailSent,
        emailError ?? null
      )
    } catch (error) {
      console.error('[decideRsvpRequest] failed to record notify state', {
        requestId: id,
        error,
      })
    }

    return { request, emailSent, emailError }
  }
}
