import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import type { AdminUser } from '@/src/entities/models/user'
import { describe, expect, it, type Mock, vi } from 'vitest'
import { clearRsvpRequestsHistoryUseCase } from '../clear-rsvp-requests-history.use-case'

const ADMIN = { id: 'admin', email: 'casal@example.com' } as AdminUser

type RepoMock = {
  [K in keyof IRsvpRequestsRepository]: Mock<IRsvpRequestsRepository[K]>
}
type AuthMock = { [K in keyof IAuthService]: Mock<IAuthService[K]> }

function makeDeps() {
  const rsvpRequestsRepo: RepoMock = {
    create: vi.fn(),
    list: vi.fn(),
    findById: vi.fn(),
    findPendingByEmail: vi.fn(),
    countPending: vi.fn(),
    countUnnotified: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    recordNotification: vi.fn(),
    deletePending: vi.fn(),
    deleteDecided: vi.fn(),
  }

  const authService: AuthMock = {
    signIn: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
  }

  authService.getCurrentUser.mockResolvedValue(ADMIN)

  return { authService, rsvpRequestsRepo }
}

describe('clearRsvpRequestsHistoryUseCase', () => {
  it('deletes every decided request and reports how many were removed', async () => {
    const deps = makeDeps()
    deps.rsvpRequestsRepo.deleteDecided.mockResolvedValue(3)

    const result = await clearRsvpRequestsHistoryUseCase(deps)()

    expect(deps.rsvpRequestsRepo.deleteDecided).toHaveBeenCalledOnce()
    expect(result).toEqual({ deletedCount: 3 })
  })

  it('throws UnauthenticatedError when no admin is signed in', async () => {
    const deps = makeDeps()
    deps.authService.getCurrentUser.mockResolvedValue(null)

    await expect(
      clearRsvpRequestsHistoryUseCase(deps)()
    ).rejects.toBeInstanceOf(UnauthenticatedError)

    expect(deps.rsvpRequestsRepo.deleteDecided).not.toHaveBeenCalled()
  })
})
