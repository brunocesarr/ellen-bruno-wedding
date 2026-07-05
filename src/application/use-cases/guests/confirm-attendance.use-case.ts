import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { InvalidInviteTokenError } from '@/src/entities/errors/guests'
import { ConfirmAttendanceInputSchema } from '@/src/entities/models/guest'
import { z } from 'zod'

export function confirmAttendanceUseCase(deps: {
  guestsRepo: IGuestsRepository
}) {
  return async (raw: unknown) => {
    const parsed = ConfirmAttendanceInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    const { inviteToken, attendees } = parsed.data

    const owner = await deps.guestsRepo.findByInviteToken(inviteToken)
    if (!owner) throw new InvalidInviteTokenError()

    const party = await deps.guestsRepo.listByPartyId(owner.partyId)
    const partyIds = new Set(party.map((g) => g.id))
    const invalid = attendees.find((a) => !partyIds.has(a.guestId))
    if (invalid) throw new InvalidInviteTokenError()

    return deps.guestsRepo.setStatuses(
      attendees.map((a) => ({ id: a.guestId, status: a.status }))
    )
  }
}
