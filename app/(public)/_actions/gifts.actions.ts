'use server'
import { generateGiftPixController } from '@/src/interface-adapters/controllers/gifts/generate-gift-pix.controller'
import { reserveGiftController } from '@/src/interface-adapters/controllers/gifts/reserve-gift.controller'
import { getOptionalString, getString } from '@/src/lib/form-data'
import { revalidateGroup } from '@/src/lib/revalidate'
import { revalidatePath } from 'next/cache'

export async function reserveGiftAction(_: unknown, formData: FormData) {
  const giftId = getString(formData, 'giftId')
  const result = await reserveGiftController({
    giftId,
    name: getString(formData, 'name'),
    message: getOptionalString(formData, 'message'),
    amount: getOptionalString(formData, 'amount'),
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
  return generateGiftPixController(input)
}
