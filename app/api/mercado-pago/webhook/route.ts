import { confirmCardPaymentUseCase } from '@/src/application/use-cases/gifts/confirm-card-payment.use-case'
import { SupabaseGiftsRepository } from '@/src/infrastructure/repositories/supabase-gifts.repository'
import { SupabasePixConfirmationsRepository } from '@/src/infrastructure/repositories/supabase-pix-confirmations.repository'
import { MercadoPagoService } from '@/src/infrastructure/services/mercado-pago.service'
import { createNotificationService } from '@/src/infrastructure/services/telegram-notification.service'
import { createSupabaseAdminClient } from '@/src/infrastructure/supabase/admin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Mercado Pago webhook. Route handlers sit outside getContainer()'s
 * cookie-based/React-cache() flow (and outside its request-scoped DI
 * altogether), so — matching app/api/keep-alive/route.ts's convention —
 * every dependency is constructed directly here, using the admin client
 * (this is the one path allowed to call reserve_gift_paid, which is
 * granted to service_role only).
 *
 * Responds fast (Mercado Pago's 22s deadline): 401 on a bad signature,
 * otherwise 200 once processed — including "already processed" and
 * "gift unavailable, recorded as untied" cases, so Mercado Pago doesn't
 * keep retrying something we've already handled. A genuine failure
 * returns 500, so Mercado Pago's retry policy (~every 15 min) gets another
 * chance to deliver it.
 */
export async function POST(req: Request) {
  const url = new URL(req.url)
  const body = await req.json().catch(() => null)

  if (!body || body.type !== 'payment' || !body.data?.id) {
    // Not a payment notification (e.g. a merchant_order ping) — ack anyway.
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  let cardPaymentService: MercadoPagoService
  try {
    cardPaymentService = new MercadoPagoService()
  } catch (error) {
    console.error('[mercado-pago webhook] service not configured', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  try {
    cardPaymentService.verifyWebhookSignature({
      signature: req.headers.get('x-signature'),
      requestId: req.headers.get('x-request-id'),
      dataId: url.searchParams.get('data.id'),
    })
  } catch (error) {
    console.error('[mercado-pago webhook] invalid signature', error)
    return NextResponse.json({ ok: false }, { status: 401 })
  }

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
      provider: 'mercado_pago',
    })(String(body.data.id))
  } catch (error) {
    console.error('[mercado-pago webhook] processing failed', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 200 })
}
