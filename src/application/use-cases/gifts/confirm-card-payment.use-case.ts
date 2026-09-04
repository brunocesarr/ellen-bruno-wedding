import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import type { IPixConfirmationsRepository } from '@/src/application/repositories/pix-confirmations.repository.interface'
import type { ICardPaymentService } from '@/src/application/services/card-payment.service.interface'
import type { INotificationService } from '@/src/application/services/notification.service.interface'
import {
  GiftAlreadyReservedError,
  GiftNotFoundError,
} from '@/src/entities/errors/gifts'
import {
  buildGiftPaymentConfirmedAlert,
  buildUntiedPaymentAlert,
} from '@/src/lib/notification-templates'

type Deps = {
  giftsRepo: IGiftsRepository
  pixRepo: IPixConfirmationsRepository
  cardPaymentService: ICardPaymentService
  notificationService: INotificationService
  /** Which rail this webhook came down — picks the idempotency lookup and
   *  which id column the payment gets recorded under. */
  provider: 'mercado_pago' | 'pagbank'
}

/**
 * Best-effort admin alert. Takes a thunk (not a pre-built string) so a bug in
 * message-building can never throw into the caller's try/catch and get
 * mistaken for a payment-processing failure — the payment is already
 * committed by the time this runs.
 */
async function notify(
  service: INotificationService,
  buildMessage: () => string
) {
  try {
    await service.send(buildMessage())
  } catch (error) {
    console.error('[confirmCardPayment] admin notification FAILED', { error })
  }
}

/**
 * Webhook-invoked. Never trusts the notification body — re-fetches the
 * payment by id and only acts on `status: 'approved'`. Commits the
 * reservation + an already-confirmed ledger row atomically via
 * reserveConfirmed(). If the gift is no longer available (a race with
 * another payment, or it was deleted/not found) the money is still
 * recorded — just unlinked (gift_id: null) — for manual admin
 * reconciliation/refund, never silently dropped.
 */
export function confirmCardPaymentUseCase(d: Deps) {
  return async (paymentId: string): Promise<void> => {
    // Idempotency pre-check: a redelivered webhook for an already-processed
    // payment (approved-and-recorded, or previously untied) is a no-op.
    const existing =
      d.provider === 'pagbank'
        ? await d.pixRepo.findByPagbankPaymentId(paymentId)
        : await d.pixRepo.findByMpPaymentId(paymentId)
    if (existing) return

    const payment = await d.cardPaymentService.getPayment(paymentId)
    if (payment.status !== 'approved') return

    const guestName = payment.guestName ?? 'Convidado(a)'
    // Whichever id column matches d.provider — kept together so every
    // pixRepo.create()/reserveConfirmed() call below stays self-consistent
    // rather than risking one branch writing the wrong provider's column.
    const providerIdFields =
      d.provider === 'pagbank'
        ? ({
            paymentProvider: 'pagbank',
            pagbankPaymentId: payment.id,
          } as const)
        : ({
            paymentProvider: 'mercado_pago',
            mpPaymentId: payment.id,
          } as const)

    if (!payment.externalReference || !payment.giftId) {
      console.error(
        '[confirmCardPayment] approved payment missing reference/metadata — recording as untied',
        { paymentId }
      )
      await d.pixRepo.create({
        guestName,
        amount: payment.transactionAmount,
        confirmed: true,
        paymentMethod: 'card',
        ...providerIdFields,
      })
      await notify(d.notificationService, () =>
        buildUntiedPaymentAlert({
          buyerName: guestName,
          amount: payment.transactionAmount,
          provider: d.provider,
        })
      )
      return
    }

    try {
      const { gift } = await d.giftsRepo.reserveConfirmed({
        id: payment.giftId,
        name: guestName,
        message: payment.message ?? undefined,
        amount: payment.transactionAmount,
        contributionId: payment.externalReference,
        paymentMethod: 'card',
        ...providerIdFields,
      })

      await notify(d.notificationService, () =>
        buildGiftPaymentConfirmedAlert({
          giftName: gift.name,
          buyerName: guestName,
          amount: payment.transactionAmount,
        })
      )
    } catch (error) {
      // Only a genuine "gift unavailable" business error falls back to the
      // untied ledger row. Anything else (including a raw duplicate-key
      // error from a concurrent redelivery racing past the pre-check above)
      // is logged and left alone — inserting again here could otherwise
      // create a second ledger row for the same payment.
      if (
        error instanceof GiftAlreadyReservedError ||
        error instanceof GiftNotFoundError
      ) {
        console.error(
          '[confirmCardPayment] payment captured but gift unavailable — recording as untied for manual reconciliation',
          { paymentId, giftId: payment.giftId, error }
        )
        await d.pixRepo.create({
          guestName,
          amount: payment.transactionAmount,
          confirmed: true,
          paymentMethod: 'card',
          ...providerIdFields,
        })
        await notify(d.notificationService, () =>
          buildUntiedPaymentAlert({
            buyerName: guestName,
            amount: payment.transactionAmount,
            provider: d.provider,
          })
        )
        return
      }

      console.error('[confirmCardPayment] failed to record confirmed payment', {
        paymentId,
        giftId: payment.giftId,
        error,
      })
    }
  }
}
