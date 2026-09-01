import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import {
  GiftAlreadyReservedError,
  GiftNotFoundError,
} from '@/src/entities/errors/gifts'
import type { Gift } from '@/src/entities/models/gift'
import { describe, expect, it, vi } from 'vitest'
import { markGiftPaidManuallyUseCase } from '../mark-gift-paid.use-case'

const ID = '33333333-3333-4333-8333-333333333333'

const gift = (overrides: Partial<Gift> = {}): Gift => ({
  id: ID,
  name: 'Liquidificador',
  description: null,
  price: 200,
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
  paymentLink: 'https://pay.example/abc',
  confirmedTotal: 0,
  pledgedTotal: 0,
  contributorCount: 0,
  ...overrides,
})

const deps = (user: unknown = { id: 'u1' }, overrides: Partial<Gift> = {}) => ({
  giftsRepo: {
    list: vi.fn(),
    getById: vi.fn().mockResolvedValue(gift(overrides)),
    reserve: vi.fn(),
    reserveConfirmed: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    markReservedManually: vi.fn(
      async (p: { id: string; reservedByName: string }) => ({
        ...gift(overrides),
        ...p,
      })
    ),
  },
  authService: { getCurrentUser: vi.fn().mockResolvedValue(user) },
})

const validInput = { id: ID, reservedByName: 'Ana Souza' }

describe('markGiftPaidManuallyUseCase', () => {
  it('throws when there is no session', async () => {
    await expect(
      markGiftPaidManuallyUseCase(deps(null) as never)(validInput)
    ).rejects.toBeInstanceOf(UnauthenticatedError)
  })

  it('rejects a missing reservedByName', async () => {
    await expect(
      markGiftPaidManuallyUseCase(deps() as never)({ id: ID })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('throws when the gift does not exist', async () => {
    const d = deps()
    d.giftsRepo.getById.mockResolvedValue(null)

    await expect(
      markGiftPaidManuallyUseCase(d as never)(validInput)
    ).rejects.toBeInstanceOf(GiftNotFoundError)
  })

  it('rejects a non fixed_item gift', async () => {
    await expect(
      markGiftPaidManuallyUseCase(
        deps(undefined, { kind: 'fund', price: null }) as never
      )(validInput)
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects an already reserved gift', async () => {
    await expect(
      markGiftPaidManuallyUseCase(
        deps(undefined, { isReserved: true }) as never
      )(validInput)
    ).rejects.toBeInstanceOf(GiftAlreadyReservedError)
  })

  it('marks the gift reserved with the given name', async () => {
    const d = deps()
    await markGiftPaidManuallyUseCase(d as never)(validInput)

    expect(d.giftsRepo.markReservedManually).toHaveBeenCalledWith({
      id: ID,
      reservedByName: 'Ana Souza',
    })
  })
})
