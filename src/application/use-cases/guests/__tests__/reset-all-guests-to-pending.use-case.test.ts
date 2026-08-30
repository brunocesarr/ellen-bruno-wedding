import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import type { Guest } from '@/src/entities/models/guest'
import { describe, expect, it, type Mock, vi } from 'vitest'
import { resetAllGuestsToPendingUseCase } from '../reset-all-guests-to-pending.use-case'

const guest = (overrides: Partial<Guest> = {}): Guest => ({
  id: '11111111-1111-4111-8111-111111111111',
  firstName: 'Ana',
  lastName: 'Souza',
  status: 'going',
  inviteToken: '22222222-2222-4222-8222-222222222222',
  partyInviteToken: '33333333-3333-4333-8333-333333333333',
  partyId: 'party-1',
  notes: null,
  confirmedAt: new Date('2026-01-01'),
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

describe('resetAllGuestsToPendingUseCase', () => {
  it('resets every guest to pending', async () => {
    const guests = [
      guest({ id: 'g1', status: 'going' }),
      guest({ id: 'g2', status: 'not_going' }),
    ]
    const guestsRepo = makeRepo()
    guestsRepo.list.mockResolvedValue(guests)
    guestsRepo.setStatuses.mockResolvedValue(
      guests.map((g) => ({ ...g, status: 'pending', confirmedAt: null }))
    )

    const result = await resetAllGuestsToPendingUseCase({
      guestsRepo: guestsRepo as never,
    })()

    expect(guestsRepo.setStatuses).toHaveBeenCalledWith([
      { id: 'g1', status: 'pending' },
      { id: 'g2', status: 'pending' },
    ])
    expect(result.every((g) => g.status === 'pending')).toBe(true)
  })

  it('does nothing when there are no guests', async () => {
    const guestsRepo = makeRepo()
    guestsRepo.list.mockResolvedValue([])

    const result = await resetAllGuestsToPendingUseCase({
      guestsRepo: guestsRepo as never,
    })()

    expect(guestsRepo.setStatuses).not.toHaveBeenCalled()
    expect(result).toEqual([])
  })
})
