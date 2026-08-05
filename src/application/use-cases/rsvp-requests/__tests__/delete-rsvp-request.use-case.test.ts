import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import {
  RsvpRequestAlreadyDecidedError,
  RsvpRequestNotFoundError,
} from '@/src/entities/errors/rsvp-requests'
import type { RsvpRequest } from '@/src/entities/models/rsvp-request'
import type { AdminUser } from '@/src/entities/models/user'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { deleteRsvpRequestUseCase } from '../delete-rsvp-request.use-case'

const ID = '11111111-1111-4111-8111-111111111111'

const ADMIN = { id: 'admin', email: 'casal@example.com' } as AdminUser

const pendingRequest: RsvpRequest = {
  id: ID,
  fullName: 'Maria Souza',
  email: 'maria@example.com',
  attending: true,
  message: null,
  status: 'pending',
  guestId: null,
  decidedAt: null,
  createdAt: new Date('2026-08-01T10:00:00Z'),
  updatedAt: new Date('2026-08-01T10:00:00Z'),
}

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
    approve: vi.fn(),
    reject: vi.fn(),
    deletePending: vi.fn(),
  }

  const authService: AuthMock = {
    signIn: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
  }

  authService.getCurrentUser.mockResolvedValue(ADMIN)
  rsvpRequestsRepo.findById.mockResolvedValue(pendingRequest)
  rsvpRequestsRepo.deletePending.mockResolvedValue(undefined)

  return { authService, rsvpRequestsRepo }
}

describe('deleteRsvpRequestUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes a pending request', async () => {
    const deps = makeDeps()

    const res = await deleteRsvpRequestUseCase(deps)({ id: ID })

    expect(deps.rsvpRequestsRepo.deletePending).toHaveBeenCalledWith(ID)
    expect(res).toEqual({ id: ID })
  })

  it('throws UnauthenticatedError when no admin is signed in', async () => {
    const deps = makeDeps()
    deps.authService.getCurrentUser.mockResolvedValue(null)

    await expect(
      deleteRsvpRequestUseCase(deps)({ id: ID })
    ).rejects.toBeInstanceOf(UnauthenticatedError)

    expect(deps.rsvpRequestsRepo.deletePending).not.toHaveBeenCalled()
  })

  it('rejects a malformed id', async () => {
    const deps = makeDeps()

    await expect(
      deleteRsvpRequestUseCase(deps)({ id: 'not-a-uuid' })
    ).rejects.toBeInstanceOf(ValidationError)

    expect(deps.rsvpRequestsRepo.deletePending).not.toHaveBeenCalled()
  })

  it('throws when the request does not exist', async () => {
    const deps = makeDeps()
    deps.rsvpRequestsRepo.findById.mockResolvedValue(null)

    await expect(
      deleteRsvpRequestUseCase(deps)({ id: ID })
    ).rejects.toBeInstanceOf(RsvpRequestNotFoundError)
  })

  it('refuses to delete an APPROVED request (audit trail)', async () => {
    const deps = makeDeps()
    deps.rsvpRequestsRepo.findById.mockResolvedValue({
      ...pendingRequest,
      status: 'approved',
    })

    await expect(
      deleteRsvpRequestUseCase(deps)({ id: ID })
    ).rejects.toBeInstanceOf(RsvpRequestAlreadyDecidedError)

    expect(deps.rsvpRequestsRepo.deletePending).not.toHaveBeenCalled()
  })

  it('refuses to delete a REJECTED request (audit trail)', async () => {
    const deps = makeDeps()
    deps.rsvpRequestsRepo.findById.mockResolvedValue({
      ...pendingRequest,
      status: 'rejected',
    })

    await expect(
      deleteRsvpRequestUseCase(deps)({ id: ID })
    ).rejects.toBeInstanceOf(RsvpRequestAlreadyDecidedError)
  })
})
