import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IEmailService } from '@/src/application/services/email.service.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { DuplicateRsvpRequestError } from '@/src/entities/errors/rsvp-requests'
import {
  CreateRsvpRequestInputSchema,
  type RsvpRequest,
} from '@/src/entities/models/rsvp-request'
import { buildRsvpDecisionEmail } from '@/src/lib/email-templates'
import { z } from 'zod'

export function submitRsvpRequestUseCase(deps: {
  rsvpRequestsRepo: IRsvpRequestsRepository
  guestsRepo: IGuestsRepository
  emailService: IEmailService
}) {
  return async (raw: unknown): Promise<RsvpRequest> => {
    const parsed = CreateRsvpRequestInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    const input = parsed.data

    const existing = await deps.rsvpRequestsRepo.findPendingByEmail(input.email)
    if (existing) throw new DuplicateRsvpRequestError()

    const created = await deps.rsvpRequestsRepo.create(input)

    const matchedGuest = await deps.guestsRepo.findByName(input.fullName)
    if (!matchedGuest) return created

    const decided = await deps.rsvpRequestsRepo.approve(created.id)

    let emailSent = false
    let emailError: string | undefined

    try {
      await deps.emailService.send(buildRsvpDecisionEmail(decided))
      emailSent = true
    } catch (error) {
      emailError =
        error instanceof Error ? error.message : 'Erro desconhecido no envio'
      console.error('[submitRsvpRequest] auto-approved, e-mail FAILED', {
        requestId: created.id,
        error,
      })
    }

    try {
      return await deps.rsvpRequestsRepo.recordNotification(
        created.id,
        emailSent,
        emailError ?? null
      )
    } catch (error) {
      console.error('[submitRsvpRequest] failed to record notify state', {
        requestId: created.id,
        error,
      })
      return decided
    }
  }
}
