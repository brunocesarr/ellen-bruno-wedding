import { confirmCardPaymentUseCase } from '@/src/application/use-cases/gifts/confirm-card-payment.use-case'
import { SupabaseGiftsRepository } from '@/src/infrastructure/repositories/supabase-gifts.repository'
import { SupabasePixConfirmationsRepository } from '@/src/infrastructure/repositories/supabase-pix-confirmations.repository'
import { PagBankService } from '@/src/infrastructure/services/pagbank.service'
import { createNotificationService } from '@/src/infrastructure/services/telegram-notification.service'
import { createSupabaseAdminClient } from '@/src/infrastructure/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * PagBank webhook. Mirrors app/api/mercado-pago/webhook/route.ts's
 * construct-everything-directly-here pattern (route handlers sit outside
 * getContainer()'s request-scoped DI) and its response-code convention:
 * 401 on a bad signature, 200 once handled (including "already processed"
 * and "gift unavailable, recorded as untied"), 500 on genuine failure so
 * PagBank retries. PagBank's docs don't state a retry cadence or deadline
 * the way Mercado Pago's ~22s/~15min are documented — confirm this once
 * sandbox webhooks are flowing.
 *
 * Unlike Mercado Pago's x-signature scheme, PagBank hashes the *raw*
 * request body — req.text() must be read before any JSON.parse, and that
 * exact string (not a re-stringified object) is what verifyWebhookSignature
 * needs. Don't reorder this to parse first "for convenience".
 *
 * TODO(pagbank): confirmCardPaymentUseCase still records the provider's
 * payment id under the `mp_payment_id` column via the repository's
 * `mpPaymentId` param — harmless (it's just a column name, idempotency and
 * uniqueness still work), but should move to a generic column once the
 * Phase 1 migration (payment_provider + pagbank_payment_id) lands.
 */
export async function POST(req: Request) {
  const rawBody = await req.text()

  let cardPaymentService: PagBankService
  try {
    cardPaymentService = new PagBankService()
  } catch (error) {
    console.error('[pagbank webhook] service not configured', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  try {
    cardPaymentService.verifyWebhookSignature({
      signature: req.headers.get('x-authenticity-token'),
      rawBody,
    })
  } catch (error) {
    console.error('[pagbank webhook] invalid signature', error)
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  // Only the Checkout API's own notifications carry a checkout id we can
  // re-fetch via GET /checkouts/{id}. x-product-origin can apparently also
  // be ORDER for other flows this integration doesn't use — ack and ignore.
  const productOrigin = req.headers.get('x-product-origin')
  const productId = req.headers.get('x-product-id')
  if (productOrigin !== 'CHECKOUT' || !productId) {
    console.log('[pagbank webhook] ignoring non-checkout notification', {
      productOrigin,
      productId,
    })
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  // Logged for sandbox inspection while the payload shape assumptions in
  // PagBankService.getPayment() (charges array, item/customer echo) are
  // still unverified against a real PagBank response — remove once confirmed.
  console.log('[pagbank webhook] received', {
    productOrigin,
    productId,
    rawBody,
  })

  const admin = createSupabaseAdminClient()
  const giftsRepo = new SupabaseGiftsRepository(admin)
  const pixRepo = new SupabasePixConfirmationsRepository(admin)
  const notificationService = createNotificationService()

  try {
    await confirmCardPaymentUseCase({
      giftsRepo,
      pixRepo,
      cardPaymentService,
      notificationService,
      provider: 'pagbank',
    })(productId)
  } catch (error) {
    console.error('[pagbank webhook] processing failed', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
