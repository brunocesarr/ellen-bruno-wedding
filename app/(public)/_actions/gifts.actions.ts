'use server'
import { reserveGiftController } from '@/src/interface-adapters/controllers/gifts/reserve-gift.controller'
import { revalidatePath } from 'next/cache'

export async function reserveGiftAction(_: unknown, formData: FormData) {
  const result = await reserveGiftController({
    giftId: formData.get('giftId'),
    name: formData.get('name'),
    message: formData.get('message') || undefined,
  })
  if (result.ok) {
    revalidatePath('/presentes')
    revalidatePath(`/presentes/${formData.get('giftId')}`)
  }
  return result
}
