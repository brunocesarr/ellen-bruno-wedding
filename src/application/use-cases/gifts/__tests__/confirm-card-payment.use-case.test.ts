import type { CardPayment } from '@/src/application/services/card-payment.service.interface'
import { GiftAlreadyReservedError } from '@/src/entities/errors/gifts'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { confirmCardPaymentUseCase } from '../confirm-card-payment.use-case'

const GIFT_ID = '11111111-1111-4111-8111-111111111111'
const PAYMENT_ID = '999999'

const payment = (overrides: Partial<CardPayment> = {}): CardPayment => ({
  id: PAYMENT_ID,
  status: 'approved',
  transactionAmount: 150,
  externalReference: 'contribution-1',
  giftId: GIFT_ID,
  guestName: 'Ana Souza',
  message: null,
  ...overrides,
})

function makeDeps() {
  const giftsRepo = {
    list: vi.fn(),
    getById: vi.fn(),
    reserve: vi.fn(),
    reserveConfirmed: vi.fn().mockResolvedValue({
      gift: { id: GIFT_ID },
      contributionId: 'contribution-1',
    }),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }
  const pixRepo = {
    list: vi.fn(),
    listByGiftId: vi.fn(),
    findByMpPaymentId: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
    deleteByGiftId: vi.fn(),
  }
  const cardPaymentService = {
    createPreference: vi.fn(),
    getPayment: vi.fn().mockResolvedValue(payment()),
    verifyWebhookSignature: vi.fn(),
  }

  return { giftsRepo, pixRepo, cardPaymentService }
}

describe('confirmCardPaymentUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('no-ops when the payment was already recorded (duplicate webhook delivery)', async () => {
    const deps = makeDeps()
    deps.pixRepo.findByMpPaymentId.mockResolvedValue({
      id: 'x',
      giftId: GIFT_ID,
      guestName: 'Ana',
      amount: 150,
      confirmed: true,
      paymentMethod: 'card',
      mpPaymentId: PAYMENT_ID,
      createdAt: new Date(),
    })

    await confirmCardPaymentUseCase(deps as never)(PAYMENT_ID)

    expect(deps.cardPaymentService.getPayment).not.toHaveBeenCalled()
    expect(deps.giftsRepo.reserveConfirmed).not.toHaveBeenCalled()
  })

  it('no-ops on a non-approved status', async () => {
    const deps = makeDeps()
    deps.cardPaymentService.getPayment.mockResolvedValue(
      payment({ status: 'rejected' })
    )

    await confirmCardPaymentUseCase(deps as never)(PAYMENT_ID)

    expect(deps.giftsRepo.reserveConfirmed).not.toHaveBeenCalled()
    expect(deps.pixRepo.create).not.toHaveBeenCalled()
  })

  it('reserves the gift with an already-confirmed, card-tagged ledger row', async () => {
    const deps = makeDeps()

    await confirmCardPaymentUseCase(deps as never)(PAYMENT_ID)

    expect(deps.giftsRepo.reserveConfirmed).toHaveBeenCalledWith({
      id: GIFT_ID,
      name: 'Ana Souza',
      message: undefined,
      amount: 150,
      contributionId: 'contribution-1',
      paymentMethod: 'card',
      mpPaymentId: PAYMENT_ID,
    })
  })

  it('trusts the re-fetched amount, never a client-suppliable value', async () => {
    const deps = makeDeps()
    deps.cardPaymentService.getPayment.mockResolvedValue(
      payment({ transactionAmount: 999.99 })
    )

    await confirmCardPaymentUseCase(deps as never)(PAYMENT_ID)

    expect(deps.giftsRepo.reserveConfirmed).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 999.99 })
    )
  })

  it('records as untied when metadata/external_reference is missing', async () => {
    const deps = makeDeps()
    deps.cardPaymentService.getPayment.mockResolvedValue(
      payment({ giftId: null, externalReference: null })
    )

    await confirmCardPaymentUseCase(deps as never)(PAYMENT_ID)

    expect(deps.giftsRepo.reserveConfirmed).not.toHaveBeenCalled()
    expect(deps.pixRepo.create).toHaveBeenCalledWith({
      guestName: 'Ana Souza',
      amount: 150,
      confirmed: true,
      paymentMethod: 'card',
      mpPaymentId: PAYMENT_ID,
    })
  })

  it('records as untied when the gift is no longer available (race with another payment)', async () => {
    const deps = makeDeps()
    deps.giftsRepo.reserveConfirmed.mockRejectedValue(
      new GiftAlreadyReservedError()
    )

    await confirmCardPaymentUseCase(deps as never)(PAYMENT_ID)

    expect(deps.pixRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        confirmed: true,
        paymentMethod: 'card',
        mpPaymentId: PAYMENT_ID,
      })
    )
  })

  it('does not double-insert on an unexpected error (e.g. a concurrent duplicate-delivery race)', async () => {
    const deps = makeDeps()
    deps.giftsRepo.reserveConfirmed.mockRejectedValue(
      new Error('duplicate key value violates unique constraint')
    )

    await confirmCardPaymentUseCase(deps as never)(PAYMENT_ID)

    expect(deps.pixRepo.create).not.toHaveBeenCalled()
  })
})
