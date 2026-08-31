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
      gift: { id: GIFT_ID, name: 'Jogo de panelas' },
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
    findByPagbankPaymentId: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    update: vi.fn(),
    deleteByGiftId: vi.fn(),
  }
  const cardPaymentService = {
    createPreference: vi.fn(),
    getPayment: vi.fn().mockResolvedValue(payment()),
    verifyWebhookSignature: vi.fn(),
  }
  const notificationService = { send: vi.fn().mockResolvedValue(undefined) }

  return {
    giftsRepo,
    pixRepo,
    cardPaymentService,
    notificationService,
    provider: 'mercado_pago' as const,
  }
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
      paymentProvider: 'mercado_pago',
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
      paymentProvider: 'mercado_pago',
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

  it('sends an admin notification once the payment is confirmed', async () => {
    const deps = makeDeps()

    await confirmCardPaymentUseCase(deps as never)(PAYMENT_ID)

    expect(deps.notificationService.send).toHaveBeenCalledOnce()
    expect(deps.notificationService.send).toHaveBeenCalledWith(
      expect.stringContaining('Jogo de panelas')
    )
  })

  it('sends an untied-payment alert when the gift is unavailable', async () => {
    const deps = makeDeps()
    deps.giftsRepo.reserveConfirmed.mockRejectedValue(
      new GiftAlreadyReservedError()
    )

    await confirmCardPaymentUseCase(deps as never)(PAYMENT_ID)

    expect(deps.notificationService.send).toHaveBeenCalledWith(
      expect.stringContaining('sem presente vinculado')
    )
  })

  it('does not blow up when the notification itself fails', async () => {
    const deps = makeDeps()
    deps.notificationService.send.mockRejectedValue(new Error('Telegram down'))

    await confirmCardPaymentUseCase(deps as never)(PAYMENT_ID)

    expect(deps.giftsRepo.reserveConfirmed).toHaveBeenCalledOnce()
  })

  describe('pagbank provider', () => {
    function makePagbankDeps() {
      return { ...makeDeps(), provider: 'pagbank' as const }
    }

    it('checks pagbank idempotency, not mercado pago, for a pagbank webhook', async () => {
      const deps = makePagbankDeps()

      await confirmCardPaymentUseCase(deps as never)(PAYMENT_ID)

      expect(deps.pixRepo.findByPagbankPaymentId).toHaveBeenCalledWith(
        PAYMENT_ID
      )
      expect(deps.pixRepo.findByMpPaymentId).not.toHaveBeenCalled()
    })

    it('no-ops when already recorded under pagbank_payment_id', async () => {
      const deps = makePagbankDeps()
      deps.pixRepo.findByPagbankPaymentId.mockResolvedValue({
        id: 'x',
        giftId: GIFT_ID,
        guestName: 'Ana',
        amount: 150,
        confirmed: true,
        paymentMethod: 'card',
        paymentProvider: 'pagbank',
        mpPaymentId: null,
        pagbankPaymentId: PAYMENT_ID,
        createdAt: new Date(),
      })

      await confirmCardPaymentUseCase(deps as never)(PAYMENT_ID)

      expect(deps.cardPaymentService.getPayment).not.toHaveBeenCalled()
      expect(deps.giftsRepo.reserveConfirmed).not.toHaveBeenCalled()
    })

    it('records the confirmed reservation under pagbankPaymentId, not mpPaymentId', async () => {
      const deps = makePagbankDeps()

      await confirmCardPaymentUseCase(deps as never)(PAYMENT_ID)

      expect(deps.giftsRepo.reserveConfirmed).toHaveBeenCalledWith({
        id: GIFT_ID,
        name: 'Ana Souza',
        message: undefined,
        amount: 150,
        contributionId: 'contribution-1',
        paymentMethod: 'card',
        paymentProvider: 'pagbank',
        pagbankPaymentId: PAYMENT_ID,
      })
    })

    it('mentions PagBank in the untied-payment alert', async () => {
      const deps = makePagbankDeps()
      deps.cardPaymentService.getPayment.mockResolvedValue(
        payment({ giftId: null, externalReference: null })
      )

      await confirmCardPaymentUseCase(deps as never)(PAYMENT_ID)

      expect(deps.pixRepo.create).toHaveBeenCalledWith({
        guestName: 'Ana Souza',
        amount: 150,
        confirmed: true,
        paymentMethod: 'card',
        paymentProvider: 'pagbank',
        pagbankPaymentId: PAYMENT_ID,
      })
      expect(deps.notificationService.send).toHaveBeenCalledWith(
        expect.stringContaining('PagBank')
      )
    })
  })
})
