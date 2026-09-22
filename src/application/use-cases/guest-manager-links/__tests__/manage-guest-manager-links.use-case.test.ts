import type { IGuestManagerLinksRepository } from '@/src/application/repositories/guest-manager-links.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import type { GuestManagerLink } from '@/src/entities/models/guest-manager-link'
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import {
  createGuestManagerLinkUseCase,
  listGuestManagerLinksUseCase,
  revokeAllGuestManagerLinksUseCase,
  revokeGuestManagerLinkUseCase,
} from '../manage-guest-manager-links.use-case'

const LINK_ID = '33333333-3333-4333-8333-333333333333'

const link: GuestManagerLink = {
  id: LINK_ID,
  token: '11111111-1111-4111-8111-111111111111',
  label: 'Tia Maria',
  isActive: true,
  expiresAt: null,
  useCount: 0,
  lastUsedAt: null,
  revokedAt: null,
  createdAt: new Date('2026-09-01T10:00:00Z'),
  updatedAt: new Date('2026-09-01T10:00:00Z'),
}

type LinksRepoMock = {
  [K in keyof IGuestManagerLinksRepository]: Mock<
    IGuestManagerLinksRepository[K]
  >
}

function makeDeps(signedIn = true) {
  const guestManagerLinksRepo: LinksRepoMock = {
    findUsableByToken: vi.fn(),
    list: vi.fn().mockResolvedValue([link]),
    create: vi.fn().mockResolvedValue(link),
    revoke: vi.fn().mockResolvedValue(true),
    revokeAllActive: vi.fn().mockResolvedValue(2),
    touch: vi.fn(),
  }

  const authService = {
    getCurrentUser: vi
      .fn()
      .mockResolvedValue(signedIn ? { id: 'admin' } : null),
  } as unknown as IAuthService

  return { authService, guestManagerLinksRepo }
}

describe('manage-guest-manager-links', () => {
  beforeEach(() => vi.clearAllMocks())

  it('requires an authenticated admin for every operation', async () => {
    const deps = makeDeps(false)

    await expect(listGuestManagerLinksUseCase(deps)()).rejects.toBeInstanceOf(
      UnauthenticatedError
    )
    await expect(
      createGuestManagerLinkUseCase(deps)({ label: 'Tia Maria' })
    ).rejects.toBeInstanceOf(UnauthenticatedError)
    await expect(
      revokeGuestManagerLinkUseCase(deps)({ id: LINK_ID })
    ).rejects.toBeInstanceOf(UnauthenticatedError)
    await expect(
      revokeAllGuestManagerLinksUseCase(deps)()
    ).rejects.toBeInstanceOf(UnauthenticatedError)

    expect(deps.guestManagerLinksRepo.create).not.toHaveBeenCalled()
    expect(deps.guestManagerLinksRepo.revoke).not.toHaveBeenCalled()
  })

  // The opposite of createInviteLinkUseCase, deliberately: one helper's link
  // must never silently kill another's.
  it('creates a link without revoking the existing ones', async () => {
    const deps = makeDeps()

    await createGuestManagerLinkUseCase(deps)({ label: '  Tia Maria  ' })

    expect(deps.guestManagerLinksRepo.create).toHaveBeenCalledWith({
      label: 'Tia Maria',
    })
    expect(deps.guestManagerLinksRepo.revokeAllActive).not.toHaveBeenCalled()
  })

  it('turns an expiry in days into the repository input', async () => {
    const deps = makeDeps()

    await createGuestManagerLinkUseCase(deps)({ expiresInDays: 30 })

    const payload = deps.guestManagerLinksRepo.create.mock.calls[0]?.[0]
    expect(payload?.expiresInDays).toBe(30)
    expect(payload?.label).toBeUndefined()
  })

  it('rejects an out-of-range expiry', async () => {
    const deps = makeDeps()

    await expect(
      createGuestManagerLinkUseCase(deps)({ expiresInDays: 4000 })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('revokes a single link by id', async () => {
    const deps = makeDeps()

    const res = await revokeGuestManagerLinkUseCase(deps)({ id: LINK_ID })

    expect(deps.guestManagerLinksRepo.revoke).toHaveBeenCalledWith(LINK_ID)
    expect(res).toEqual({ revoked: true })
  })

  it('reports how many links the panic button killed', async () => {
    const deps = makeDeps()

    await expect(revokeAllGuestManagerLinksUseCase(deps)()).resolves.toEqual({
      revoked: 2,
    })
  })
})
