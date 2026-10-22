import type { IGuestManagerLinksRepository } from '@/src/application/repositories/guest-manager-links.repository.interface'
import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { GuestManagerAccessDeniedError } from '@/src/entities/errors/guest-manager-links'
import { GuestNotFoundError } from '@/src/entities/errors/guests'
import type { Guest } from '@/src/entities/models/guest'
import type { GuestManagerLink } from '@/src/entities/models/guest-manager-link'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import {
  getGuestManagerContextUseCase,
  touchGuestManagerLinkUseCase,
  updateManagedGuestUseCase,
} from '../guest-manager-access.use-case'

const TOKEN = '11111111-1111-4111-8111-111111111111'
const GUEST_ID = '22222222-2222-4222-8222-222222222222'

const link: GuestManagerLink = {
  id: '33333333-3333-4333-8333-333333333333',
  token: TOKEN,
  label: 'Tia Maria',
  isActive: true,
  expiresAt: null,
  useCount: 3,
  lastUsedAt: null,
  revokedAt: null,
  createdAt: new Date('2026-09-01T10:00:00Z'),
  updatedAt: new Date('2026-09-01T10:00:00Z'),
}

const guest: Guest = {
  id: GUEST_ID,
  firstName: 'Ana',
  lastName: 'Souza',
  status: 'pending',
  inviteToken: '44444444-4444-4444-8444-444444444444',
  partyInviteToken: '55555555-5555-4555-8555-555555555555',
  partyId: '66666666-6666-4666-8666-666666666666',
  notes: 'Alergia a frutos do mar',
  childAgeGroup: null,
  confirmedAt: null,
  createdAt: new Date('2026-08-01T10:00:00Z'),
  updatedAt: new Date('2026-08-01T10:00:00Z'),
}

type LinksRepoMock = {
  [K in keyof IGuestManagerLinksRepository]: Mock<
    IGuestManagerLinksRepository[K]
  >
}
type GuestsRepoMock = {
  [K in keyof IGuestsRepository]: Mock<IGuestsRepository[K]>
}

function makeDeps() {
  const guestManagerLinksRepo: LinksRepoMock = {
    findUsableByToken: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
    revoke: vi.fn(),
    revokeAllActive: vi.fn(),
    touch: vi.fn(),
  }
  const guestsRepo: GuestsRepoMock = {
    list: vi.fn(),
    findById: vi.fn(),
    findByInviteToken: vi.fn(),
    findByName: vi.fn(),
    findByPartyInviteToken: vi.fn(),
    listByPartyId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateNameAndStatus: vi.fn(),
    setStatuses: vi.fn(),
  }

  guestManagerLinksRepo.findUsableByToken.mockResolvedValue(link)
  guestsRepo.list.mockResolvedValue([guest])
  guestsRepo.findById.mockResolvedValue(guest)
  guestsRepo.updateNameAndStatus.mockImplementation(async (input) => ({
    ...guest,
    firstName: input.firstName ?? guest.firstName,
    lastName: input.lastName ?? guest.lastName,
    status: input.status ?? guest.status,
  }))

  return { guestManagerLinksRepo, guestsRepo }
}

describe('getGuestManagerContextUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns the list without any invite token or private note', async () => {
    const deps = makeDeps()

    const res = await getGuestManagerContextUseCase(deps)(TOKEN)

    expect(res.label).toBe('Tia Maria')
    expect(res.guests).toEqual([
      {
        id: GUEST_ID,
        firstName: 'Ana',
        lastName: 'Souza',
        status: 'pending',
        partyId: guest.partyId,
      },
    ])

    // The whole point of the projection: a manager link must never carry a
    // personal invite token, so re-assert it on the serialised payload.
    const serialised = JSON.stringify(res)
    expect(serialised).not.toContain(guest.inviteToken)
    expect(serialised).not.toContain(guest.partyInviteToken)
    expect(serialised).not.toContain('Alergia')
  })

  it('rejects an unknown, revoked or expired token', async () => {
    const deps = makeDeps()
    deps.guestManagerLinksRepo.findUsableByToken.mockResolvedValue(null)

    await expect(
      getGuestManagerContextUseCase(deps)(TOKEN)
    ).rejects.toBeInstanceOf(GuestManagerAccessDeniedError)

    expect(deps.guestsRepo.list).not.toHaveBeenCalled()
  })

  it('rejects a malformed token without hitting either repository', async () => {
    const deps = makeDeps()

    await expect(
      getGuestManagerContextUseCase(deps)('not-a-uuid')
    ).rejects.toBeInstanceOf(GuestManagerAccessDeniedError)

    expect(deps.guestManagerLinksRepo.findUsableByToken).not.toHaveBeenCalled()
    expect(deps.guestsRepo.list).not.toHaveBeenCalled()
  })
})

describe('updateManagedGuestUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renames a guest through the narrowed repository method', async () => {
    const deps = makeDeps()

    const res = await updateManagedGuestUseCase(deps)({
      token: TOKEN,
      guestId: GUEST_ID,
      firstName: 'Ana Clara',
      lastName: 'Souza Lima',
    })

    expect(deps.guestsRepo.updateNameAndStatus).toHaveBeenCalledWith({
      id: GUEST_ID,
      firstName: 'Ana Clara',
      lastName: 'Souza Lima',
      status: undefined,
    })
    expect(deps.guestsRepo.update).not.toHaveBeenCalled()
    expect(res.firstName).toBe('Ana Clara')
  })

  it('changes a status', async () => {
    const deps = makeDeps()

    const res = await updateManagedGuestUseCase(deps)({
      token: TOKEN,
      guestId: GUEST_ID,
      status: 'going',
    })

    expect(res.status).toBe('going')
  })

  it('silently drops fields outside the manager scope', async () => {
    const deps = makeDeps()

    await updateManagedGuestUseCase(deps)({
      token: TOKEN,
      guestId: GUEST_ID,
      status: 'going',
      notes: 'não deveria passar',
      partyId: '77777777-7777-4777-8777-777777777777',
    })

    const payload = deps.guestsRepo.updateNameAndStatus.mock.calls[0]?.[0]
    expect(payload).toBeDefined()
    expect(payload).not.toHaveProperty('notes')
    expect(payload).not.toHaveProperty('partyId')
  })

  it('validates the token before looking a guest up', async () => {
    const deps = makeDeps()
    deps.guestManagerLinksRepo.findUsableByToken.mockResolvedValue(null)

    await expect(
      updateManagedGuestUseCase(deps)({
        token: TOKEN,
        guestId: GUEST_ID,
        status: 'going',
      })
    ).rejects.toBeInstanceOf(GuestManagerAccessDeniedError)

    expect(deps.guestsRepo.findById).not.toHaveBeenCalled()
    expect(deps.guestsRepo.updateNameAndStatus).not.toHaveBeenCalled()
  })

  it('throws when the guest does not exist', async () => {
    const deps = makeDeps()
    deps.guestsRepo.findById.mockResolvedValue(null)

    await expect(
      updateManagedGuestUseCase(deps)({
        token: TOKEN,
        guestId: GUEST_ID,
        status: 'going',
      })
    ).rejects.toBeInstanceOf(GuestNotFoundError)
  })

  it('rejects a payload that changes nothing', async () => {
    const deps = makeDeps()

    await expect(
      updateManagedGuestUseCase(deps)({ token: TOKEN, guestId: GUEST_ID })
    ).rejects.toBeInstanceOf(ValidationError)

    expect(deps.guestsRepo.updateNameAndStatus).not.toHaveBeenCalled()
  })

  it('rejects an empty name', async () => {
    const deps = makeDeps()

    await expect(
      updateManagedGuestUseCase(deps)({
        token: TOKEN,
        guestId: GUEST_ID,
        firstName: '',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })
})

describe('touchGuestManagerLinkUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('bumps the counter for a well-formed token', async () => {
    const deps = makeDeps()

    await touchGuestManagerLinkUseCase(deps)(TOKEN)

    expect(deps.guestManagerLinksRepo.touch).toHaveBeenCalledWith(TOKEN)
  })

  it('ignores a malformed token instead of throwing into after()', async () => {
    const deps = makeDeps()

    await expect(
      touchGuestManagerLinkUseCase(deps)('nope')
    ).resolves.toBeUndefined()

    expect(deps.guestManagerLinksRepo.touch).not.toHaveBeenCalled()
  })
})
