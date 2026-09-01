import { UnauthenticatedError } from '@/src/entities/errors/auth'
import type { Expense } from '@/src/entities/models/expense'
import type { Gift } from '@/src/entities/models/gift'
import type { Guest } from '@/src/entities/models/guest'
import type { RsvpRequest } from '@/src/entities/models/rsvp-request'
import { describe, expect, it, vi } from 'vitest'
import { getDashboardStatsUseCase } from '../get-stats.use-case'

const gift = (overrides: Partial<Gift> = {}): Gift => ({
  id: 'g1',
  name: 'Liquidificador',
  description: null,
  price: 100,
  imagePath: null,
  isReserved: false,
  reservedByName: null,
  reservedByEmail: null,
  reservedMessage: null,
  reservedAt: null,
  category: 'kitchen',
  kind: 'fixed_item',
  minAmount: null,
  suggestedAmounts: [],
  goalAmount: null,
  paymentLink: null,
  confirmedTotal: 0,
  pledgedTotal: 0,
  contributorCount: 0,
  ...overrides,
})

const guest = (overrides: Partial<Guest> = {}): Guest => ({
  id: 'gu1',
  firstName: 'Ana',
  lastName: 'Souza',
  status: 'going',
  inviteToken: 't1',
  partyInviteToken: 'pt1',
  partyId: 'party-1',
  notes: null,
  confirmedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
})

const rsvpRequest = (overrides: Partial<RsvpRequest> = {}): RsvpRequest => ({
  id: 'r1',
  fullName: 'Carla Lima',
  email: 'carla@example.com',
  attending: true,
  message: null,
  status: 'pending',
  guestId: null,
  decidedAt: null,
  notifiedAt: null,
  notifyAttempts: 0,
  notifyError: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
})

const expense = (overrides: Partial<Expense> = {}): Expense => ({
  id: 'e1',
  description: 'Buffet',
  totalAmount: 300,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  installments: [],
  ...overrides,
})

function makeDeps({
  gifts = [],
  rsvps = [],
  pix = [],
  guests = [],
  rsvpRequests = [],
  expenses = [],
  user = { id: 'admin' },
}: {
  gifts?: Gift[]
  rsvps?: unknown[]
  pix?: unknown[]
  guests?: Guest[]
  rsvpRequests?: RsvpRequest[]
  expenses?: Expense[]
  user?: unknown
} = {}) {
  return {
    giftsRepo: { list: vi.fn().mockResolvedValue(gifts) },
    rsvpRepo: { list: vi.fn().mockResolvedValue(rsvps) },
    pixRepo: { list: vi.fn().mockResolvedValue(pix) },
    guestsRepo: { list: vi.fn().mockResolvedValue(guests) },
    rsvpRequestsRepo: { list: vi.fn().mockResolvedValue(rsvpRequests) },
    expensesRepo: { list: vi.fn().mockResolvedValue(expenses) },
    authService: { getCurrentUser: vi.fn().mockResolvedValue(user) },
  }
}

describe('getDashboardStatsUseCase — auth', () => {
  it('throws when there is no session', async () => {
    await expect(
      getDashboardStatsUseCase(makeDeps({ user: null }) as never)()
    ).rejects.toBeInstanceOf(UnauthenticatedError)
  })
})

describe('getDashboardStatsUseCase — guests and requests summary', () => {
  it('tallies guests and requests by status', async () => {
    const deps = makeDeps({
      guests: [
        guest({ id: 'g1', status: 'going' }),
        guest({ id: 'g2', status: 'pending' }),
        guest({ id: 'g3', status: 'not_going' }),
      ],
      rsvpRequests: [
        rsvpRequest({ id: 'r1', status: 'pending' }),
        rsvpRequest({ id: 'r2', status: 'approved' }),
        rsvpRequest({ id: 'r3', status: 'rejected' }),
      ],
    })

    const stats = await getDashboardStatsUseCase(deps as never)()

    expect(stats.guestsSummary).toEqual({
      total: 3,
      going: 1,
      pending: 1,
      notGoing: 1,
    })
    expect(stats.requestsSummary).toEqual({
      total: 3,
      pending: 1,
      approved: 1,
      rejected: 1,
    })
  })
})

describe('getDashboardStatsUseCase — income vs expenses', () => {
  it('computes total/paid expenses and the net balance against income received', async () => {
    const deps = makeDeps({
      gifts: [
        gift({
          id: 'g1',
          isReserved: true,
          confirmedTotal: 100,
          pledgedTotal: 100,
        }),
      ],
      pix: [
        { giftId: 'g1', confirmed: true, amount: 100, createdAt: new Date() },
      ],
      expenses: [
        expense({
          totalAmount: 300,
          installments: [
            {
              id: 'i1',
              dueDate: '2026-01-01',
              amount: 150,
              paidAmount: 150,
              paidBy: null,
            },
            {
              id: 'i2',
              dueDate: '2026-02-01',
              amount: 150,
              paidAmount: 50,
              paidBy: null,
            },
          ],
        }),
      ],
    })

    const stats = await getDashboardStatsUseCase(deps as never)()

    expect(stats.totalExpenses).toBe(300)
    expect(stats.totalExpensesPaid).toBe(200)
    expect(stats.totalReceived).toBe(100)
    expect(stats.netBalance).toBe(100 - 200)
  })
})

describe('getDashboardStatsUseCase — gifts by category', () => {
  it('groups confirmed and pledged totals by category', async () => {
    const deps = makeDeps({
      gifts: [
        gift({
          id: 'g1',
          category: 'kitchen',
          confirmedTotal: 100,
          pledgedTotal: 100,
        }),
        gift({
          id: 'g2',
          category: 'kitchen',
          confirmedTotal: 0,
          pledgedTotal: 50,
        }),
        gift({
          id: 'g3',
          category: 'travel',
          confirmedTotal: 200,
          pledgedTotal: 200,
        }),
      ],
      pix: [
        { giftId: 'g1', confirmed: true, amount: 100, createdAt: new Date() },
        { giftId: 'g3', confirmed: true, amount: 200, createdAt: new Date() },
      ],
    })

    const stats = await getDashboardStatsUseCase(deps as never)()

    const kitchen = stats.giftsByCategory.find((c) => c.category === 'kitchen')
    const travel = stats.giftsByCategory.find((c) => c.category === 'travel')

    expect(kitchen).toEqual({
      category: 'kitchen',
      giftCount: 2,
      confirmedTotal: 100,
      pledgedTotal: 150,
    })
    expect(travel).toEqual({
      category: 'travel',
      giftCount: 1,
      confirmedTotal: 200,
      pledgedTotal: 200,
    })
  })
})
