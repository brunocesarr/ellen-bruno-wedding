import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import { InvalidInviteTokenError } from '@/src/entities/errors/guests'
import type { InviteContext } from '@/src/entities/models/guest'

export const getInviteContextUseCase =
  (deps: { guestsRepo: IGuestsRepository }) =>
  async (token: string): Promise<InviteContext> => {
    if (!token) throw new InvalidInviteTokenError()

    const guest = await deps.guestsRepo.findByInviteToken(token)
    if (!guest) throw new InvalidInviteTokenError()

    const party = await deps.guestsRepo.listByPartyId(guest.partyId)
    return {
      guest,
      partyMembers: party.filter((g) => g.id !== guest.id),
    }
  }
