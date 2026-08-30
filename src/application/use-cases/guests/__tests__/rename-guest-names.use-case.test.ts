import { ValidationError } from '@/src/entities/errors/common'
import { InvalidInviteTokenError } from '@/src/entities/errors/guests'
import { describe, expect, it, vi } from 'vitest'
import { renameGuestNamesUseCase } from '../rename-guest-names.use-case'

const TOKEN = '11111111-1111-4111-8111-111111111111'
const OWNER_ID = '22222222-2222-4222-8222-222222222222'
const MEMBER_ID = '33333333-3333-4333-8333-333333333333'
const OUTSIDER_ID = '44444444-4444-4444-8444-444444444444'

const owner = {
  id: OWNER_ID,
  firstName: 'Ana',
  lastName: 'Souza',
  partyId: 'party-1',
}
const member = {
  id: MEMBER_ID,
  firstName: 'Bruno',
  lastName: 'Souza',
  partyId: 'party-1',
}

const repo = () => ({
  list: vi.fn(),
  findById: vi.fn(),
  findByInviteToken: vi.fn().mockResolvedValue(owner),
  findByName: vi.fn(),
  findByPartyInviteToken: vi.fn(),
  listByPartyId: vi.fn().mockResolvedValue([owner, member]),
  create: vi.fn(),
  update: vi.fn().mockImplementation((input) => Promise.resolve(input)),
  delete: vi.fn(),
  setStatuses: vi.fn(),
})

describe('renameGuestNamesUseCase', () => {
  it('rejects a malformed invite token', async () => {
    await expect(
      renameGuestNamesUseCase({ guestsRepo: repo() as never })({
        inviteToken: 'nope',
        names: [{ guestId: OWNER_ID, firstName: 'Ana', lastName: 'Souza' }],
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects an unknown invite token', async () => {
    const guestsRepo = repo()
    guestsRepo.findByInviteToken.mockResolvedValue(null)

    await expect(
      renameGuestNamesUseCase({ guestsRepo: guestsRepo as never })({
        inviteToken: TOKEN,
        names: [{ guestId: OWNER_ID, firstName: 'Ana', lastName: 'Souza' }],
      })
    ).rejects.toBeInstanceOf(InvalidInviteTokenError)
  })

  it('rejects a guestId outside the caller party', async () => {
    const guestsRepo = repo()

    await expect(
      renameGuestNamesUseCase({ guestsRepo: guestsRepo as never })({
        inviteToken: TOKEN,
        names: [{ guestId: OUTSIDER_ID, firstName: 'Carla', lastName: 'Lima' }],
      })
    ).rejects.toBeInstanceOf(InvalidInviteTokenError)

    expect(guestsRepo.update).not.toHaveBeenCalled()
  })

  it('updates the owner and a party member by id', async () => {
    const guestsRepo = repo()

    const result = await renameGuestNamesUseCase({
      guestsRepo: guestsRepo as never,
    })({
      inviteToken: TOKEN,
      names: [
        { guestId: OWNER_ID, firstName: 'Anna', lastName: 'Souza' },
        { guestId: MEMBER_ID, firstName: 'Bruno', lastName: 'Souza Jr' },
      ],
    })

    expect(guestsRepo.update).toHaveBeenCalledWith({
      id: OWNER_ID,
      firstName: 'Anna',
      lastName: 'Souza',
    })
    expect(guestsRepo.update).toHaveBeenCalledWith({
      id: MEMBER_ID,
      firstName: 'Bruno',
      lastName: 'Souza Jr',
    })
    expect(result).toHaveLength(2)
  })
})
