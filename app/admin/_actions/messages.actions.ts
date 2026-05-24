'use server'

import {
  listMessagesController,
  markAsThankedController,
} from '@/src/interface-adapters/controllers/gifts/messages.controller'
import { revalidatePath } from 'next/cache'

export async function listMessagesAction() {
  return listMessagesController()
}

export async function markAsThankedAction(giftId: string) {
  const result = await markAsThankedController(giftId)
  if (result.ok) {
    revalidatePath('/admin')
    revalidatePath('/admin/mensagens')
    revalidatePath('/admin/resumo')
  }
  return result
}
