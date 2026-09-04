import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import { GuestNotFoundError } from '@/src/entities/errors/guests'
import { AssignGuestPartyInputSchema } from '@/src/entities/models/guest'
import { z } from 'zod'

export function assignGuestPartyUseCase(deps: {
  guestsRepo: IGuestsRepository
  authService: IAuthService
}) {
  return async (raw: unknown) => {
    if (!(await deps.authService.getCurrentUser())) {
      throw new UnauthenticatedError()
    }

    const parsed = AssignGuestPartyInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    const { guestId, targetGuestId } = parsed.data
    if (guestId === targetGuestId) {
      throw new ValidationError({
        formErrors: ['Selecione outro convidado para o grupo.'],
        fieldErrors: {},
      })
    }

    const [guest, target] = await Promise.all([
      deps.guestsRepo.findById(guestId),
      deps.guestsRepo.findById(targetGuestId),
    ])
    if (!guest) throw new GuestNotFoundError()
    if (!target) throw new GuestNotFoundError()

    if (guest.partyId === target.partyId) return guest

    return deps.guestsRepo.update({ id: guestId, partyId: target.partyId })
  }
}
