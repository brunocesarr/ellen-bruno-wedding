import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import type { IEmailService } from '@/src/application/services/email.service.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { DuplicateRsvpRequestError } from '@/src/entities/errors/rsvp-requests'
import type { Guest } from '@/src/entities/models/guest'
import type {
  CreateRsvpRequestInput,
  RsvpRequest,
} from '@/src/entities/models/rsvp-request'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { submitRsvpRequestUseCase } from '../submit-rsvp-request.use-case'

const ID = '11111111-1111-4111-8111-111111111111'
const GUEST_ID = '22222222-2222-4222-8222-222222222222'

type RsvpRequestsRepoMock = {
  [K in keyof IRsvpRequestsRepository]: Mock<IRsvpRequestsRepository[K]>
}
type GuestsRepoMock = {
  [K in keyof IGuestsRepository]: Mock<IGuestsRepository[K]>
}
type EmailServiceMock = {
  [K in keyof IEmailService]: Mock<IEmailService[K]>
}

const asRequest = (
  input: CreateRsvpRequestInput,
  overrides: Partial<RsvpRequest> = {}
): RsvpRequest => ({
  id: ID,
  fullName: input.fullName,
  email: input.email,
  attending: input.attending,
  message: input.message ?? null,
  status: 'pending',
  guestId: null,
  decidedAt: null,
  notifiedAt: null,
  notifyAttempts: 0,
  notifyError: null,
  createdAt: new Date('2026-08-01T10:00:00Z'),
  updatedAt: new Date('2026-08-01T10:00:00Z'),
  ...overrides,
})

const asGuest = (overrides: Partial<Guest> = {}): Guest => ({
  id: GUEST_ID,
  firstName: 'Maria',
  lastName: 'Souza',
  status: 'pending',
  inviteToken: '33333333-3333-4333-8333-333333333333',
  partyInviteToken: '44444444-4444-4444-8444-444444444444',
  partyId: '55555555-5555-4555-8555-555555555555',
  notes: null,
  confirmedAt: null,
  createdAt: new Date('2026-01-01T10:00:00Z'),
  updatedAt: new Date('2026-01-01T10:00:00Z'),
  ...overrides,
})

function makeRsvpRequestsRepo(): RsvpRequestsRepoMock {
  const repo: RsvpRequestsRepoMock = {
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

  repo.findPendingByEmail.mockResolvedValue(null)
  repo.create.mockImplementation(async (input) => asRequest(input))

  return repo
}

function makeGuestsRepo(): GuestsRepoMock {
  const repo: GuestsRepoMock = {
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

  repo.findByName.mockResolvedValue(null)

  return repo
}

function makeEmailService(): EmailServiceMock {
  const service: EmailServiceMock = { send: vi.fn() }
  service.send.mockResolvedValue(undefined)
  return service
}

const validInput = {
  fullName: 'Maria Souza',
  email: 'maria@example.com',
  attending: true,
  message: 'Que alegria!',
}

function makeDeps() {
  return {
    rsvpRequestsRepo: makeRsvpRequestsRepo(),
    guestsRepo: makeGuestsRepo(),
    emailService: makeEmailService(),
  }
}

describe('submitRsvpRequestUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a request for valid input', async () => {
    const deps = makeDeps()

    const result = await submitRsvpRequestUseCase(deps)(validInput)

    expect(deps.rsvpRequestsRepo.create).toHaveBeenCalledOnce()
    expect(result).toMatchObject({ fullName: 'Maria Souza' })
  })

  it('starts life unnotified', async () => {
    const deps = makeDeps()

    const result = await submitRsvpRequestUseCase(deps)(validInput)

    expect(result.status).toBe('pending')
    expect(result.notifiedAt).toBeNull()
    expect(result.notifyAttempts).toBe(0)
  })

  it('rejects a single-word name (guests.last_name is NOT NULL)', async () => {
    const deps = makeDeps()

    await expect(
      submitRsvpRequestUseCase(deps)({ ...validInput, fullName: 'Maria' })
    ).rejects.toBeInstanceOf(ValidationError)

    expect(deps.rsvpRequestsRepo.create).not.toHaveBeenCalled()
  })

  it('rejects an invalid e-mail', async () => {
    const deps = makeDeps()

    await expect(
      submitRsvpRequestUseCase(deps)({ ...validInput, email: 'not-an-email' })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('normalises internal whitespace in the name', async () => {
    const deps = makeDeps()

    await submitRsvpRequestUseCase(deps)({
      ...validInput,
      fullName: '  Maria   das   Dores  ',
    })

    expect(deps.rsvpRequestsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'Maria das Dores' })
    )
  })

  it('blocks a duplicate pending request for the same e-mail', async () => {
    const deps = makeDeps()
    deps.rsvpRequestsRepo.findPendingByEmail.mockResolvedValue(
      asRequest(validInput)
    )

    await expect(
      submitRsvpRequestUseCase(deps)(validInput)
    ).rejects.toBeInstanceOf(DuplicateRsvpRequestError)

    expect(deps.rsvpRequestsRepo.create).not.toHaveBeenCalled()
  })

  it('drops an empty message instead of storing whitespace', async () => {
    const deps = makeDeps()

    await submitRsvpRequestUseCase(deps)({ ...validInput, message: '   ' })

    expect(deps.rsvpRequestsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ message: undefined })
    )
  })

  it('accepts attending = false', async () => {
    const deps = makeDeps()

    await submitRsvpRequestUseCase(deps)({ ...validInput, attending: false })

    expect(deps.rsvpRequestsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ attending: false })
    )
  })

  it('checks for a matching guest by the submitted name', async () => {
    const deps = makeDeps()

    await submitRsvpRequestUseCase(deps)(validInput)

    expect(deps.guestsRepo.findByName).toHaveBeenCalledWith('Maria Souza')
  })

  describe('when the name matches a known invitee', () => {
    it('auto-approves the request instead of leaving it pending', async () => {
      const deps = makeDeps()
      deps.guestsRepo.findByName.mockResolvedValue(asGuest())
      deps.rsvpRequestsRepo.approve.mockResolvedValue(
        asRequest(validInput, { status: 'approved', guestId: GUEST_ID })
      )
      deps.rsvpRequestsRepo.recordNotification.mockImplementation(
        async (id, ok) =>
          asRequest(validInput, {
            status: 'approved',
            guestId: GUEST_ID,
            notifiedAt: ok ? new Date('2026-08-01T10:00:01Z') : null,
          })
      )

      const result = await submitRsvpRequestUseCase(deps)(validInput)

      expect(deps.rsvpRequestsRepo.approve).toHaveBeenCalledWith(ID)
      expect(result.status).toBe('approved')
      expect(result.guestId).toBe(GUEST_ID)
    })

    it('sends the decision e-mail immediately and records success', async () => {
      const deps = makeDeps()
      deps.guestsRepo.findByName.mockResolvedValue(asGuest())
      const decided = asRequest(validInput, {
        status: 'approved',
        guestId: GUEST_ID,
      })
      deps.rsvpRequestsRepo.approve.mockResolvedValue(decided)
      deps.rsvpRequestsRepo.recordNotification.mockResolvedValue({
        ...decided,
        notifiedAt: new Date('2026-08-01T10:00:01Z'),
      })

      await submitRsvpRequestUseCase(deps)(validInput)

      expect(deps.emailService.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: validInput.email })
      )
      expect(deps.rsvpRequestsRepo.recordNotification).toHaveBeenCalledWith(
        ID,
        true,
        null
      )
    })

    it('tolerates e-mail failure: the guest update still stands', async () => {
      const deps = makeDeps()
      deps.guestsRepo.findByName.mockResolvedValue(asGuest())
      const decided = asRequest(validInput, {
        status: 'approved',
        guestId: GUEST_ID,
      })
      deps.rsvpRequestsRepo.approve.mockResolvedValue(decided)
      deps.emailService.send.mockRejectedValue(new Error('SMTP down'))
      deps.rsvpRequestsRepo.recordNotification.mockResolvedValue({
        ...decided,
        notifyError: 'SMTP down',
      })

      const result = await submitRsvpRequestUseCase(deps)(validInput)

      expect(result.status).toBe('approved')
      expect(deps.rsvpRequestsRepo.recordNotification).toHaveBeenCalledWith(
        ID,
        false,
        'SMTP down'
      )
    })
  })

  describe('when the name does not match any invitee', () => {
    it('leaves the request pending and sends no e-mail', async () => {
      const deps = makeDeps()

      const result = await submitRsvpRequestUseCase(deps)(validInput)

      expect(deps.rsvpRequestsRepo.approve).not.toHaveBeenCalled()
      expect(deps.emailService.send).not.toHaveBeenCalled()
      expect(deps.rsvpRequestsRepo.recordNotification).not.toHaveBeenCalled()
      expect(result.status).toBe('pending')
    })
  })
})
