import { ValidationError } from '@/src/entities/errors/common'
import {
  CardPaymentUnavailableError,
  GiftAlreadyReservedError,
  GiftAmountRequiredError,
  GiftAmountTooLowError,
  GiftNotFoundError,
} from '@/src/entities/errors/gifts'
import type { Gift } from '@/src/entities/models/gift'
import { describe, expect, it, vi } from 'vitest'
import { createGiftCardPaymentUseCase } from '../create-gift-card-payment.use-case'

const ID = '11111111-1111-4111-8111-111111111111'

const gift = (overrides: Partial<Gift> = {}): Gift => ({
  id: ID,
  name: 'Liquidificador',
  description: null,
  price: 200,
  imagePath: null,
  isReserved: false,
  reservedByName: null,
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

const giftsRepo = (overrides: Partial<Gift> = {}) => ({
  list: vi.fn(),
  getById: vi.fn().mockResolvedValue(gift(overrides)),
  reserve: vi.fn(),
  reserveConfirmed: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
})

const cardPaymentService = () => ({
  createPreference: vi
    .fn()
    .mockResolvedValue({ checkoutUrl: 'https://mp.example/checkout/abc' }),
  getPayment: vi.fn(),
  verifyWebhookSignature: vi.fn(),
})

const validInput = { giftId: ID, name: 'Ana Souza', email: 'ana@example.com' }

const isCardPaymentAvailable = () => true

describe('createGiftCardPaymentUseCase', () => {
  it('rejects a malformed gift id', async () => {
    await expect(
      createGiftCardPaymentUseCase({
        giftsRepo: giftsRepo() as never,
        cardPaymentService: cardPaymentService(),
        isCardPaymentAvailable,
      })({ giftId: 'nope', name: 'Ana' })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('throws when the gift does not exist', async () => {
    const repo = giftsRepo()
    repo.getById.mockResolvedValue(null)

    await expect(
      createGiftCardPaymentUseCase({
        giftsRepo: repo as never,
        cardPaymentService: cardPaymentService(),
        isCardPaymentAvailable,
      })(validInput)
    ).rejects.toBeInstanceOf(GiftNotFoundError)
  })

  it('throws when a fixed_item is already reserved', async () => {
    await expect(
      createGiftCardPaymentUseCase({
        giftsRepo: giftsRepo({ isReserved: true }) as never,
        cardPaymentService: cardPaymentService(),
        isCardPaymentAvailable,
      })(validInput)
    ).rejects.toBeInstanceOf(GiftAlreadyReservedError)
  })

  it('never locks a fund, even when isReserved is somehow true', async () => {
    const repo = giftsRepo({
      kind: 'fund',
      price: null,
      isReserved: true,
      goalAmount: 1000,
    })
    const service = cardPaymentService()

    await createGiftCardPaymentUseCase({
      giftsRepo: repo as never,
      cardPaymentService: service,
      isCardPaymentAvailable,
    })({ ...validInput, amount: 100 })

    expect(service.createPreference).toHaveBeenCalledOnce()
  })

  it('uses the gift price for fixed_item, ignoring any client-supplied amount', async () => {
    const repo = giftsRepo({ price: 350 })
    const service = cardPaymentService()

    await createGiftCardPaymentUseCase({
      giftsRepo: repo as never,
      cardPaymentService: service,
      isCardPaymentAvailable,
    })({ ...validInput, amount: 1 })

    expect(service.createPreference).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 350 })
    )
  })

  it('requires an amount for open_item', async () => {
    await expect(
      createGiftCardPaymentUseCase({
        giftsRepo: giftsRepo({ kind: 'open_item', price: null }) as never,
        cardPaymentService: cardPaymentService(),
        isCardPaymentAvailable,
      })(validInput)
    ).rejects.toBeInstanceOf(GiftAmountRequiredError)
  })

  it('rejects an amount below minAmount', async () => {
    await expect(
      createGiftCardPaymentUseCase({
        giftsRepo: giftsRepo({
          kind: 'open_item',
          price: null,
          minAmount: 50,
        }) as never,
        cardPaymentService: cardPaymentService(),
        isCardPaymentAvailable,
      })({ ...validInput, amount: 10 })
    ).rejects.toBeInstanceOf(GiftAmountTooLowError)
  })

  it('forwards the guest email as the preference payer', async () => {
    const service = cardPaymentService()

    await createGiftCardPaymentUseCase({
      giftsRepo: giftsRepo() as never,
      cardPaymentService: service,
      isCardPaymentAvailable,
    })(validInput)

    expect(service.createPreference).toHaveBeenCalledWith(
      expect.objectContaining({ guestEmail: 'ana@example.com' })
    )
  })

  it('generates a fresh contribution id per call', async () => {
    const service = cardPaymentService()

    await createGiftCardPaymentUseCase({
      giftsRepo: giftsRepo() as never,
      cardPaymentService: service,
      isCardPaymentAvailable,
    })(validInput)

    expect(service.createPreference.mock.calls[0]?.[0].contributionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
  })

  it('returns the checkout URL without writing anything to the DB', async () => {
    const repo = giftsRepo()
    const result = await createGiftCardPaymentUseCase({
      giftsRepo: repo as never,
      cardPaymentService: cardPaymentService(),
      isCardPaymentAvailable,
    })(validInput)

    expect(result).toEqual({ checkoutUrl: 'https://mp.example/checkout/abc' })
    expect(repo.reserve).not.toHaveBeenCalled()
    expect(repo.reserveConfirmed).not.toHaveBeenCalled()
  })

  it('throws CardPaymentUnavailableError when the flag/threshold check fails', async () => {
    await expect(
      createGiftCardPaymentUseCase({
        giftsRepo: giftsRepo() as never,
        cardPaymentService: cardPaymentService(),
        isCardPaymentAvailable: () => false,
      })(validInput)
    ).rejects.toBeInstanceOf(CardPaymentUnavailableError)
  })

  it('passes the resolved charge amount (not the raw request) to the eligibility check', async () => {
    const check = vi.fn().mockReturnValue(true)

    await createGiftCardPaymentUseCase({
      giftsRepo: giftsRepo({ price: 350 }) as never,
      cardPaymentService: cardPaymentService(),
      isCardPaymentAvailable: check,
    })({ ...validInput, amount: 1 })

    expect(check).toHaveBeenCalledWith(350)
  })
})
