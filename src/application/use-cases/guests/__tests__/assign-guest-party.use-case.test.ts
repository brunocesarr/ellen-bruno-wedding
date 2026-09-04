import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import { GuestNotFoundError } from '@/src/entities/errors/guests'
import type { Guest } from '@/src/entities/models/guest'
import { describe, expect, it, type Mock, vi } from 'vitest'
import { assignGuestPartyUseCase } from '../assign-guest-party.use-case'

const GUEST_ID = '11111111-1111-4111-8111-111111111111'
const TARGET_ID = '22222222-2222-4222-8222-222222222222'

const guest = (overrides: Partial<Guest> = {}): Guest => ({
  id: GUEST_ID,
  firstName: 'Ana',
  lastName: 'Souza',
  status: 'pending',
  inviteToken: '33333333-3333-4333-8333-333333333333',
  partyInviteToken: '44444444-4444-4444-8444-444444444444',
  partyId: 'party-1',
  notes: null,
  confirmedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
})

type RepoMock = { [K in keyof IGuestsRepository]: Mock<IGuestsRepository[K]> }

function makeRepo(): RepoMock {
  return {
    list: vi.fn(),
    findById: vi.fn(),
    findByInviteToken: vi.fn(),
    findByName: vi.fn(),
    findByPartyInviteToken: vi.fn(),
    listByPartyId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    setStatuses: vi.fn(),
  }
}

const authedService = (): IAuthService => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'admin-1' }),
})

describe('assignGuestPartyUseCase', () => {
  it('rejects an unauthenticated caller', async () => {
    const guestsRepo = makeRepo()
    const authService: IAuthService = {
      signIn: vi.fn(),
      signOut: vi.fn(),
      getCurrentUser: vi.fn().mockResolvedValue(null),
    }

    await expect(
      assignGuestPartyUseCase({ guestsRepo: guestsRepo as never, authService })(
        { guestId: GUEST_ID, targetGuestId: TARGET_ID }
      )
    ).rejects.toBeInstanceOf(UnauthenticatedError)
    expect(guestsRepo.update).not.toHaveBeenCalled()
  })

  it('rejects malformed input', async () => {
    const guestsRepo = makeRepo()

    await expect(
      assignGuestPartyUseCase({
        guestsRepo: guestsRepo as never,
        authService: authedService(),
      })({ guestId: 'nope', targetGuestId: TARGET_ID })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects assigning a guest to itself', async () => {
    const guestsRepo = makeRepo()

    await expect(
      assignGuestPartyUseCase({
        guestsRepo: guestsRepo as never,
        authService: authedService(),
      })({ guestId: GUEST_ID, targetGuestId: GUEST_ID })
    ).rejects.toBeInstanceOf(ValidationError)
    expect(guestsRepo.update).not.toHaveBeenCalled()
  })

  it('throws when the source guest is not found', async () => {
    const guestsRepo = makeRepo()
    guestsRepo.findById.mockImplementation((id) =>
      Promise.resolve(id === TARGET_ID ? guest({ id: TARGET_ID }) : null)
    )

    await expect(
      assignGuestPartyUseCase({
        guestsRepo: guestsRepo as never,
        authService: authedService(),
      })({ guestId: GUEST_ID, targetGuestId: TARGET_ID })
    ).rejects.toBeInstanceOf(GuestNotFoundError)
  })

  it('throws when the target guest is not found', async () => {
    const guestsRepo = makeRepo()
    guestsRepo.findById.mockImplementation((id) =>
      Promise.resolve(id === GUEST_ID ? guest() : null)
    )

    await expect(
      assignGuestPartyUseCase({
        guestsRepo: guestsRepo as never,
        authService: authedService(),
      })({ guestId: GUEST_ID, targetGuestId: TARGET_ID })
    ).rejects.toBeInstanceOf(GuestNotFoundError)
  })

  it('is a no-op when both guests are already in the same party', async () => {
    const guestsRepo = makeRepo()
    guestsRepo.findById.mockImplementation((id) =>
      Promise.resolve(
        id === GUEST_ID
          ? guest({ id: GUEST_ID, partyId: 'party-1' })
          : guest({ id: TARGET_ID, partyId: 'party-1' })
      )
    )

    const result = await assignGuestPartyUseCase({
      guestsRepo: guestsRepo as never,
      authService: authedService(),
    })({ guestId: GUEST_ID, targetGuestId: TARGET_ID })

    expect(guestsRepo.update).not.toHaveBeenCalled()
    expect(result.partyId).toBe('party-1')
  })

  it('reassigns the source guest to the target party', async () => {
    const guestsRepo = makeRepo()
    guestsRepo.findById.mockImplementation((id) =>
      Promise.resolve(
        id === GUEST_ID
          ? guest({ id: GUEST_ID, partyId: 'party-1' })
          : guest({ id: TARGET_ID, partyId: 'party-2' })
      )
    )
    guestsRepo.update.mockImplementation((input) =>
      Promise.resolve(guest({ id: input.id, partyId: input.partyId }))
    )

    const result = await assignGuestPartyUseCase({
      guestsRepo: guestsRepo as never,
      authService: authedService(),
    })({ guestId: GUEST_ID, targetGuestId: TARGET_ID })

    expect(guestsRepo.update).toHaveBeenCalledWith({
      id: GUEST_ID,
      partyId: 'party-2',
    })
    expect(result.partyId).toBe('party-2')
  })
})
