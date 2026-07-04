'use server'
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
  })
  if (result.ok) {
    revalidateGroup('gifts')
    revalidatePath(`/presentes/${giftId}`)
  }
  return result
}
