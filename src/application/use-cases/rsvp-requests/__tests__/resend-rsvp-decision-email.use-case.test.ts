import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import type { IEmailService } from '@/src/application/services/email.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import {
  RsvpDecisionEmailFailedError,
  RsvpRequestNotDecidedError,
  RsvpRequestNotFoundError,
} from '@/src/entities/errors/rsvp-requests'
import type { RsvpRequest } from '@/src/entities/models/rsvp-request'
import type { AdminUser } from '@/src/entities/models/user'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { resendRsvpDecisionEmailUseCase } from '../resend-rsvp-decision-email.use-case'

const ID = '11111111-1111-4111-8111-111111111111'
const ADMIN = { id: 'admin', email: 'casal@example.com' } as AdminUser

const unnotified: RsvpRequest = {
  id: ID,
  fullName: 'Maria Souza',
  email: 'maria@example.com',
  attending: true,
  message: null,
  status: 'approved',
  guestId: '22222222-2222-4222-8222-222222222222',
  decidedAt: new Date('2026-08-02T10:00:00Z'),
  notifiedAt: null,
  notifyAttempts: 1,
  notifyError: 'smtp down',
  createdAt: new Date('2026-08-01T10:00:00Z'),
  updatedAt: new Date('2026-08-02T10:00:00Z'),
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
  rsvpRequestsRepo.findById.mockResolvedValue(unnotified)
  rsvpRequestsRepo.recordNotification.mockResolvedValue({
    ...unnotified,
    notifiedAt: new Date('2026-08-03T09:00:00Z'),
    notifyAttempts: 2,
    notifyError: null,
  })
  emailService.send.mockResolvedValue(undefined)

  return { authService, rsvpRequestsRepo, emailService }
}

describe('resendRsvpDecisionEmailUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('resends and marks the request as notified', async () => {
    const deps = makeDeps()

    const res = await resendRsvpDecisionEmailUseCase(deps)({ id: ID })

    expect(deps.emailService.send).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'maria@example.com' })
    )
    expect(deps.rsvpRequestsRepo.recordNotification).toHaveBeenCalledWith(
      ID,
      true,
      null
    )
    expect(res.notifiedAt).not.toBeNull()
    expect(res.notifyError).toBeNull()
  })

  it('throws UnauthenticatedError when no admin is signed in', async () => {
    const deps = makeDeps()
    deps.authService.getCurrentUser.mockResolvedValue(null)

    await expect(
      resendRsvpDecisionEmailUseCase(deps)({ id: ID })
    ).rejects.toBeInstanceOf(UnauthenticatedError)

    expect(deps.emailService.send).not.toHaveBeenCalled()
  })

  it('refuses to resend for a PENDING request', async () => {
    const deps = makeDeps()
    deps.rsvpRequestsRepo.findById.mockResolvedValue({
      ...unnotified,
      status: 'pending',
      decidedAt: null,
    })

    await expect(
      resendRsvpDecisionEmailUseCase(deps)({ id: ID })
    ).rejects.toBeInstanceOf(RsvpRequestNotDecidedError)

    expect(deps.emailService.send).not.toHaveBeenCalled()
  })

  it('throws when the request does not exist', async () => {
    const deps = makeDeps()
    deps.rsvpRequestsRepo.findById.mockResolvedValue(null)

    await expect(
      resendRsvpDecisionEmailUseCase(deps)({ id: ID })
    ).rejects.toBeInstanceOf(RsvpRequestNotFoundError)
  })

  // Unlike decide, resend MUST surface a failure to the admin.
  it('records the failed attempt and throws when sending fails', async () => {
    const deps = makeDeps()
    deps.emailService.send.mockRejectedValue(new Error('quota exceeded'))

    await expect(
      resendRsvpDecisionEmailUseCase(deps)({ id: ID })
    ).rejects.toBeInstanceOf(RsvpDecisionEmailFailedError)

    expect(deps.rsvpRequestsRepo.recordNotification).toHaveBeenCalledWith(
      ID,
      false,
      'quota exceeded'
    )
  })
})
