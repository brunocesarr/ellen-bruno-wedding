import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import type { IEmailService } from '@/src/application/services/email.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import {
  RsvpRequestAlreadyDecidedError,
  RsvpRequestNotFoundError,
} from '@/src/entities/errors/rsvp-requests'
import type { RsvpRequest } from '@/src/entities/models/rsvp-request'
import type { AdminUser } from '@/src/entities/models/user'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { decideRsvpRequestUseCase } from '../decide-rsvp-request.use-case'

const ID = '11111111-1111-4111-8111-111111111111'
const GUEST_ID = '22222222-2222-4222-8222-222222222222'

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
  notifiedAt: null,
  notifyAttempts: 0,
  notifyError: null,
  createdAt: new Date('2026-08-01T10:00:00Z'),
  updatedAt: new Date('2026-08-01T10:00:00Z'),
}

const approvedRequest: RsvpRequest = {
  ...pendingRequest,
  status: 'approved',
  guestId: GUEST_ID,
  decidedAt: new Date('2026-08-02T10:00:00Z'),
}

const notifiedRequest: RsvpRequest = {
  ...approvedRequest,
  notifiedAt: new Date('2026-08-02T10:00:05Z'),
  notifyAttempts: 1,
}

type RepoMock = {
  [K in keyof IRsvpRequestsRepository]: Mock<IRsvpRequestsRepository[K]>
}
type AuthMock = { [K in keyof IAuthService]: Mock<IAuthService[K]> }
type EmailMock = { [K in keyof IEmailService]: Mock<IEmailService[K]> }

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
  }

  const authService: AuthMock = {
    signIn: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
  }

  const emailService: EmailMock = { send: vi.fn() }

  authService.getCurrentUser.mockResolvedValue(ADMIN)
  rsvpRequestsRepo.findById.mockResolvedValue(pendingRequest)
  rsvpRequestsRepo.approve.mockResolvedValue(approvedRequest)
  rsvpRequestsRepo.reject.mockResolvedValue({
    ...pendingRequest,
    status: 'rejected',
    decidedAt: new Date('2026-08-02T10:00:00Z'),
  })
  rsvpRequestsRepo.recordNotification.mockResolvedValue(notifiedRequest)
  emailService.send.mockResolvedValue(undefined)

  return { authService, rsvpRequestsRepo, emailService }
}

describe('decideRsvpRequestUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('throws UnauthenticatedError when no admin is signed in', async () => {
    const deps = makeDeps()
    deps.authService.getCurrentUser.mockResolvedValue(null)

    await expect(
      decideRsvpRequestUseCase(deps)({ id: ID, decision: 'approved' })
    ).rejects.toBeInstanceOf(UnauthenticatedError)

    expect(deps.rsvpRequestsRepo.approve).not.toHaveBeenCalled()
    expect(deps.emailService.send).not.toHaveBeenCalled()
  })

  it('commits BEFORE sending (ordering guarantee)', async () => {
    const deps = makeDeps()
    const order: string[] = []

    deps.rsvpRequestsRepo.approve.mockImplementation(async () => {
      order.push('commit')
      return approvedRequest
    })
    deps.emailService.send.mockImplementation(async () => {
      order.push('email')
    })

    await decideRsvpRequestUseCase(deps)({ id: ID, decision: 'approved' })

    expect(order).toEqual(['commit', 'email'])
  })

  it('approves and reports emailSent: true', async () => {
    const deps = makeDeps()

    const res = await decideRsvpRequestUseCase(deps)({
      id: ID,
      decision: 'approved',
    })

    expect(deps.rsvpRequestsRepo.approve).toHaveBeenCalledWith(ID)
    expect(deps.emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'maria@example.com' })
    )
    expect(deps.rsvpRequestsRepo.recordNotification).toHaveBeenCalledWith(
      ID,
      true,
      null
    )
    expect(res.emailSent).toBe(true)
    expect(res.emailError).toBeUndefined()
    expect(res.request.notifiedAt).not.toBeNull()
  })

  // --- The core regression test for this change ---------------------------
  it('STILL applies the decision when the e-mail fails', async () => {
    const deps = makeDeps()
    deps.emailService.send.mockRejectedValue(new Error('smtp down'))
    deps.rsvpRequestsRepo.recordNotification.mockResolvedValue({
      ...approvedRequest,
      notifyAttempts: 1,
      notifyError: 'smtp down',
    })

    const res = await decideRsvpRequestUseCase(deps)({
      id: ID,
      decision: 'approved',
    })

    expect(deps.rsvpRequestsRepo.approve).toHaveBeenCalledWith(ID)
    expect(res.emailSent).toBe(false)
    expect(res.emailError).toBe('smtp down')
    expect(res.request.notifiedAt).toBeNull()
    expect(deps.rsvpRequestsRepo.recordNotification).toHaveBeenCalledWith(
      ID,
      false,
      'smtp down'
    )
  })

  it('does not throw when notification bookkeeping fails', async () => {
    const deps = makeDeps()
    deps.rsvpRequestsRepo.recordNotification.mockRejectedValue(
      new Error('rpc unavailable')
    )

    const res = await decideRsvpRequestUseCase(deps)({
      id: ID,
      decision: 'approved',
    })

    // Falls back to the committed row rather than losing the decision.
    expect(res.request.status).toBe('approved')
    expect(res.emailSent).toBe(true)
  })

  it('rejects and reports the decision', async () => {
    const deps = makeDeps()

    const res = await decideRsvpRequestUseCase(deps)({
      id: ID,
      decision: 'rejected',
    })

    expect(deps.rsvpRequestsRepo.reject).toHaveBeenCalledWith(ID)
    expect(deps.emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining('Sobre sua solicitação'),
      })
    )
    expect(res.emailSent).toBe(true)
  })

  it('throws when the request does not exist', async () => {
    const deps = makeDeps()
    deps.rsvpRequestsRepo.findById.mockResolvedValue(null)

    await expect(
      decideRsvpRequestUseCase(deps)({ id: ID, decision: 'approved' })
    ).rejects.toBeInstanceOf(RsvpRequestNotFoundError)

    expect(deps.rsvpRequestsRepo.approve).not.toHaveBeenCalled()
  })

  it('refuses to decide an already-decided request', async () => {
    const deps = makeDeps()
    deps.rsvpRequestsRepo.findById.mockResolvedValue(approvedRequest)

    await expect(
      decideRsvpRequestUseCase(deps)({ id: ID, decision: 'rejected' })
    ).rejects.toBeInstanceOf(RsvpRequestAlreadyDecidedError)

    expect(deps.emailService.send).not.toHaveBeenCalled()
  })
})
