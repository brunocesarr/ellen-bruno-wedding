'use server'
import { HONEYPOT_FIELD } from '@/components/ui/Honeypot'
import { createGiftCardPaymentController } from '@/src/interface-adapters/controllers/gifts/create-gift-card-payment.controller'
import { generateGiftPixController } from '@/src/interface-adapters/controllers/gifts/generate-gift-pix.controller'
import { incrementGiftViewController } from '@/src/interface-adapters/controllers/gifts/increment-gift-view.controller'
import { reserveGiftController } from '@/src/interface-adapters/controllers/gifts/reserve-gift.controller'
import { getOptionalString, getString } from '@/src/lib/form-data'
import { enforceRateLimit } from '@/src/lib/rate-limit'
import { revalidateGroup } from '@/src/lib/revalidate'
import { revalidatePath } from 'next/cache'

export async function reserveGiftAction(_: unknown, formData: FormData) {
  if (getOptionalString(formData, HONEYPOT_FIELD)) {
    return { ok: false as const, error: 'Não foi possível concluir.' }
  }
  const limited = await enforceRateLimit('reserve-gift', {
    max: 10,
    windowSeconds: 600,
  })
  if (limited) return limited

  const giftId = getString(formData, 'giftId')
  const result = await reserveGiftController({
    giftId,
    name: getString(formData, 'name'),
    message: getOptionalString(formData, 'message'),
    amount: getOptionalString(formData, 'amount'),
    contributionId: getOptionalString(formData, 'contributionId'),
  })
  if (result.ok) {
    revalidateGroup('gifts')
    revalidatePath(`/presentes/${giftId}`)
  }
  return result
}

/**
 * Called from the client once the guest picks an amount. Read-only: it neither
 * reserves nor records anything, so no revalidation.
 */
export async function generateGiftPixAction(input: {
  giftId: string
  amount: string
}) {
  const limited = await enforceRateLimit('gift-pix', {
    max: 30,
    windowSeconds: 600,
  })
  if (limited) return limited
  return generateGiftPixController(input)
}

/**
 * Creates a Mercado Pago checkout preference and returns its URL. Read-only
 * from our own DB's perspective: nothing is reserved/recorded until the
 * webhook confirms payment (confirmCardPaymentUseCase), so no revalidation.
 */
export async function createGiftCardPaymentAction(input: {
  giftId: string
  name: string
  email: string
  message?: string
  amount?: string
}) {
  const limited = await enforceRateLimit('gift-card', {
    max: 10,
    windowSeconds: 600,
  })
  if (limited) return limited
  return createGiftCardPaymentController(input)
}

/** Best-effort view counter. Schedule with `after()`; never await in render. */
export async function incrementGiftViewAction(giftId: string) {
  return incrementGiftViewController(giftId)
}
