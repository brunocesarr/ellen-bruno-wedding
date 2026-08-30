import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { InvalidInviteTokenError } from '@/src/entities/errors/guests'
import { RenameGuestNamesInputSchema } from '@/src/entities/models/guest'
import { z } from 'zod'

export function renameGuestNamesUseCase(deps: {
  guestsRepo: IGuestsRepository
}) {
  return async (raw: unknown) => {
    const parsed = RenameGuestNamesInputSchema.safeParse(raw)
    if (!parsed.success) throw new ValidationError(z.flattenError(parsed.error))

    const { inviteToken, names } = parsed.data

    const owner = await deps.guestsRepo.findByInviteToken(inviteToken)
    if (!owner) throw new InvalidInviteTokenError()

    const party = await deps.guestsRepo.listByPartyId(owner.partyId)
    const partyIds = new Set(party.map((g) => g.id))
    const invalid = names.find((n) => !partyIds.has(n.guestId))
    if (invalid) throw new InvalidInviteTokenError()

    return Promise.all(
      names.map((n) =>
        deps.guestsRepo.update({
          id: n.guestId,
          firstName: n.firstName,
          lastName: n.lastName,
        })
      )
    )
  }
}
