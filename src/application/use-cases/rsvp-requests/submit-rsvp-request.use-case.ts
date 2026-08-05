import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { DuplicateRsvpRequestError } from '@/src/entities/errors/rsvp-requests'
import { CreateRsvpRequestInputSchema } from '@/src/entities/models/rsvp-request'
import { z } from 'zod'

export function submitRsvpRequestUseCase(deps: {
  rsvpRequestsRepo: IRsvpRequestsRepository
}) {
  return async (raw: unknown) => {
    const parsed = CreateRsvpRequestInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    const input = parsed.data

    const existing = await deps.rsvpRequestsRepo.findPendingByEmail(input.email)
    if (existing) throw new DuplicateRsvpRequestError()

    return deps.rsvpRequestsRepo.create(input)
  }
}
