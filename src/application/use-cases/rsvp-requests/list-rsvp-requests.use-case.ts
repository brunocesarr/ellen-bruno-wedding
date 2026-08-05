import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import { RsvpRequestStatusSchema } from '@/src/entities/models/rsvp-request'
import { z } from 'zod'

const InputSchema = z.object({
  status: RsvpRequestStatusSchema.optional(),
})

/**
 * Fails closed with UnauthenticatedError rather than relying on RLS alone:
 * an RLS-only denial returns an empty array, which the admin UI would render
 * as a legitimately empty inbox.
 */
export function listRsvpRequestsUseCase(deps: {
  authService: IAuthService
  rsvpRequestsRepo: IRsvpRequestsRepository
}) {
  return async (raw: unknown = {}) => {
    const user = await deps.authService.getCurrentUser()
    if (!user) throw new UnauthenticatedError()

    const parsed = InputSchema.safeParse(raw ?? {})
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    return deps.rsvpRequestsRepo.list(parsed.data.status)
  }
}
