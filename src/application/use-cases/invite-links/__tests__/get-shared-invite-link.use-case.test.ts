import type { IInviteLinksRepository } from '@/src/application/repositories/invite-links.repository.interface'
import { InviteLinkNotFoundError } from '@/src/entities/errors/invite-links'
import type { InviteLink } from '@/src/entities/models/invite-link'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { getSharedInviteLinkUseCase } from '../get-shared-invite-link.use-case'

const TOKEN = '33333333-3333-4333-8333-333333333333'

const activeLink: InviteLink = {
  id: '44444444-4444-4444-8444-444444444444',
  token: TOKEN,
  label: 'Link compartilhável',
  isActive: true,
  visitCount: 7,
  lastVisitedAt: new Date('2026-08-03T12:00:00Z'),
  revokedAt: null,
  createdAt: new Date('2026-08-01T10:00:00Z'),
  updatedAt: new Date('2026-08-03T12:00:00Z'),
}

type RepoMock = {
  [K in keyof IInviteLinksRepository]: Mock<IInviteLinksRepository[K]>
}

function makeRepo(): RepoMock {
  const repo: RepoMock = {
    findActiveByToken: vi.fn(),
    findActive: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
    revokeAllActive: vi.fn(),
    touch: vi.fn(),
  }
  repo.findActiveByToken.mockResolvedValue(activeLink)
  return repo
}

describe('getSharedInviteLinkUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('resolves an active shared token', async () => {
    const repo = makeRepo()

    const res = await getSharedInviteLinkUseCase({ inviteLinksRepo: repo })(
      TOKEN
    )

    expect(repo.findActiveByToken).toHaveBeenCalledWith(TOKEN)
    expect(res.token).toBe(TOKEN)
  })

  it('rejects an unknown or revoked token', async () => {
    const repo = makeRepo()
    repo.findActiveByToken.mockResolvedValue(null)

    await expect(
      getSharedInviteLinkUseCase({ inviteLinksRepo: repo })(TOKEN)
    ).rejects.toBeInstanceOf(InviteLinkNotFoundError)
  })

  // Same error for malformed input: never let a caller probe token existence.
  it('rejects a malformed token without hitting the repository', async () => {
    const repo = makeRepo()

    await expect(
      getSharedInviteLinkUseCase({ inviteLinksRepo: repo })('not-a-uuid')
    ).rejects.toBeInstanceOf(InviteLinkNotFoundError)

    expect(repo.findActiveByToken).not.toHaveBeenCalled()
  })
})
