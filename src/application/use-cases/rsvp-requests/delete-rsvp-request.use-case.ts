import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import {
  RsvpRequestAlreadyDecidedError,
  RsvpRequestNotFoundError,
} from '@/src/entities/errors/rsvp-requests'
import { z } from 'zod'

const InputSchema = z.object({
  id: z.string().uuid('Solicitação inválida'),
})

/**
 * Deletes a request that has NOT yet been decided. Decided requests are the
 * audit trail of who was told what, so they are permanent.
 */
export function deleteRsvpRequestUseCase(deps: {
  authService: IAuthService
  rsvpRequestsRepo: IRsvpRequestsRepository
}) {
  return async (raw: unknown) => {
    const user = await deps.authService.getCurrentUser()
    if (!user) throw new UnauthenticatedError()

    const parsed = InputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    const { id } = parsed.data

    const current = await deps.rsvpRequestsRepo.findById(id)
    if (!current) throw new RsvpRequestNotFoundError()
    if (current.status !== 'pending') throw new RsvpRequestAlreadyDecidedError()

    // The repository re-checks `status = 'pending'` in SQL, closing the gap
    // between this read and the delete.
    await deps.rsvpRequestsRepo.deletePending(id)

    return { id }
  }
}
