import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import type { IEmailService } from '@/src/application/services/email.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import {
  RsvpDecisionEmailFailedError,
  RsvpRequestAlreadyDecidedError,
  RsvpRequestNotFoundError,
} from '@/src/entities/errors/rsvp-requests'
import type { RsvpRequest } from '@/src/entities/models/rsvp-request'
import type { AdminUser } from '@/src/entities/models/user'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { decideRsvpRequestUseCase } from '../decide-rsvp-request.use-case'

const ID = '11111111-1111-4111-8111-111111111111'
const GUEST_ID = '22222222-2222-4222-8222-222222222222'

// Only truthiness matters to the use case, so the exact AdminUser shape is
// irrelevant here — cast rather than over-specify it.
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

const approvedRequest: RsvpRequest = {
  ...pendingRequest,
  status: 'approved',
  guestId: GUEST_ID,
  decidedAt: new Date('2026-08-02T10:00:00Z'),
}

const rejectedRequest: RsvpRequest = {
  ...pendingRequest,
  status: 'rejected',
  decidedAt: new Date('2026-08-02T10:00:00Z'),
}

/**
 * Mapped mock types keyed off the real interfaces. This is what makes
 * mockResolvedValue accept the full union (e.g. RsvpRequest | null) instead of
 * the narrow literal TypeScript would otherwise infer from an implementation.
 */
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
    approve: vi.fn(),
    reject: vi.fn(),
    deletePending: vi.fn(),
  }

  const authService: AuthMock = {
    signIn: vi.fn(),
    signOut: vi.fn(),
    getCurrentUser: vi.fn(),
  }

  const emailService: EmailMock = { send: vi.fn() }

  // Happy-path defaults; each test overrides what it needs.
  authService.getCurrentUser.mockResolvedValue(ADMIN)
  rsvpRequestsRepo.findById.mockResolvedValue(pendingRequest)
  rsvpRequestsRepo.approve.mockResolvedValue(approvedRequest)
  rsvpRequestsRepo.reject.mockResolvedValue(rejectedRequest)
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

    expect(deps.emailService.send).not.toHaveBeenCalled()
    expect(deps.rsvpRequestsRepo.approve).not.toHaveBeenCalled()
  })

  it('approves after the e-mail is delivered', async () => {
    const deps = makeDeps()

    const res = await decideRsvpRequestUseCase(deps)({
      id: ID,
      decision: 'approved',
    })

    expect(deps.emailService.send).toHaveBeenCalledOnce()
    expect(deps.emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'maria@example.com' })
    )
    expect(deps.rsvpRequestsRepo.approve).toHaveBeenCalledWith(ID)
    expect(res.status).toBe('approved')
  })

  it('rejects after the e-mail is delivered', async () => {
    const deps = makeDeps()

    const res = await decideRsvpRequestUseCase(deps)({
      id: ID,
      decision: 'rejected',
    })

    expect(deps.emailService.send).toHaveBeenCalledOnce()
    expect(deps.rsvpRequestsRepo.reject).toHaveBeenCalledWith(ID)
    expect(res.status).toBe('rejected')
  })

  // --- The core regression test for the send-first design -----------------
  it('does NOT apply the decision when the e-mail fails', async () => {
    const deps = makeDeps()
    deps.emailService.send.mockRejectedValue(new Error('smtp down'))

    await expect(
      decideRsvpRequestUseCase(deps)({ id: ID, decision: 'approved' })
    ).rejects.toBeInstanceOf(RsvpDecisionEmailFailedError)

    expect(deps.rsvpRequestsRepo.approve).not.toHaveBeenCalled()
    expect(deps.rsvpRequestsRepo.reject).not.toHaveBeenCalled()
  })

  it('sends the e-mail BEFORE committing (ordering guarantee)', async () => {
    const deps = makeDeps()
    const order: string[] = []

    deps.emailService.send.mockImplementation(async () => {
      order.push('email')
    })
    deps.rsvpRequestsRepo.approve.mockImplementation(async () => {
      order.push('commit')
      return approvedRequest
    })

    await decideRsvpRequestUseCase(deps)({ id: ID, decision: 'approved' })

    expect(order).toEqual(['email', 'commit'])
  })

  it('builds the e-mail from the INTENDED status, not the stored one', async () => {
    const deps = makeDeps()

    await decideRsvpRequestUseCase(deps)({ id: ID, decision: 'rejected' })

    // The rejection template subject differs from the approval one.
    expect(deps.emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining('Sobre sua solicitação'),
      })
    )
  })

  it('throws when the request does not exist', async () => {
    const deps = makeDeps()
    deps.rsvpRequestsRepo.findById.mockResolvedValue(null)

    await expect(
      decideRsvpRequestUseCase(deps)({ id: ID, decision: 'approved' })
    ).rejects.toBeInstanceOf(RsvpRequestNotFoundError)

    expect(deps.emailService.send).not.toHaveBeenCalled()
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
