'use server'

import {
  listMessagesController,
  markAsThankedController,
} from '@/src/interface-adapters/controllers/gifts/messages.controller'
import { revalidateGroup } from '@/src/lib/revalidate'

export async function listMessagesAction() {
  return listMessagesController()
}

export async function markAsThankedAction(giftId: string) {
  const result = await markAsThankedController(giftId)
  if (result.ok) revalidateGroup('messages')
  return result
}
