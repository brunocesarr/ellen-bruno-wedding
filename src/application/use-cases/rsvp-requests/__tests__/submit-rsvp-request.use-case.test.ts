import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { DuplicateRsvpRequestError } from '@/src/entities/errors/rsvp-requests'
import type {
  CreateRsvpRequestInput,
  RsvpRequest,
} from '@/src/entities/models/rsvp-request'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { submitRsvpRequestUseCase } from '../submit-rsvp-request.use-case'

const ID = '11111111-1111-4111-8111-111111111111'

type RepoMock = {
  [K in keyof IRsvpRequestsRepository]: Mock<IRsvpRequestsRepository[K]>
}

const asRequest = (input: CreateRsvpRequestInput): RsvpRequest => ({
  id: ID,
  fullName: input.fullName,
  email: input.email,
  attending: input.attending,
  message: input.message ?? null,
  status: 'pending',
  guestId: null,
  decidedAt: null,
  createdAt: new Date('2026-08-01T10:00:00Z'),
  updatedAt: new Date('2026-08-01T10:00:00Z'),
})

function makeRepo(): RepoMock {
  const repo: RepoMock = {
    create: vi.fn(),
    list: vi.fn(),
    findById: vi.fn(),
    findPendingByEmail: vi.fn(),
    countPending: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    deletePending: vi.fn(),
  }

  repo.findPendingByEmail.mockResolvedValue(null)
  repo.create.mockImplementation(async (input) => asRequest(input))

  return repo
}

const validInput = {
  fullName: 'Maria Souza',
  email: 'maria@example.com',
  attending: true,
  message: 'Que alegria!',
}

describe('submitRsvpRequestUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a request for valid input', async () => {
    const repo = makeRepo()

    const result = await submitRsvpRequestUseCase({
      rsvpRequestsRepo: repo,
    })(validInput)

    expect(repo.create).toHaveBeenCalledOnce()
    expect(result).toMatchObject({ fullName: 'Maria Souza' })
  })

  it('rejects a single-word name (guests.last_name is NOT NULL)', async () => {
    const repo = makeRepo()

    await expect(
      submitRsvpRequestUseCase({ rsvpRequestsRepo: repo })({
        ...validInput,
        fullName: 'Maria',
      })
    ).rejects.toBeInstanceOf(ValidationError)

    expect(repo.create).not.toHaveBeenCalled()
  })

  it('rejects an invalid e-mail', async () => {
    const repo = makeRepo()

    await expect(
      submitRsvpRequestUseCase({ rsvpRequestsRepo: repo })({
        ...validInput,
        email: 'not-an-email',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('normalises internal whitespace in the name', async () => {
    const repo = makeRepo()

    await submitRsvpRequestUseCase({ rsvpRequestsRepo: repo })({
      ...validInput,
      fullName: '  Maria   das   Dores  ',
    })

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'Maria das Dores' })
    )
  })

  it('blocks a duplicate pending request for the same e-mail', async () => {
    const repo = makeRepo()
    repo.findPendingByEmail.mockResolvedValue(asRequest(validInput))

    await expect(
      submitRsvpRequestUseCase({ rsvpRequestsRepo: repo })(validInput)
    ).rejects.toBeInstanceOf(DuplicateRsvpRequestError)

    expect(repo.create).not.toHaveBeenCalled()
  })

  it('drops an empty message instead of storing whitespace', async () => {
    const repo = makeRepo()

    await submitRsvpRequestUseCase({ rsvpRequestsRepo: repo })({
      ...validInput,
      message: '   ',
    })

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ message: undefined })
    )
  })

  it('accepts attending = false', async () => {
    const repo = makeRepo()

    await submitRsvpRequestUseCase({ rsvpRequestsRepo: repo })({
      ...validInput,
      attending: false,
    })

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ attending: false })
    )
  })
})
