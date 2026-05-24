import { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import type { MessageWithGift } from '@/src/application/use-cases/gifts/list-messages.use-case'
import { resolveStorageUrl } from './_storage'

export type MessageViewModel = {
  id: string
  guestName: string
  message: string
  thanked: boolean
  createdAt: string
  gift: { name: string; price: number | null; imageUrl: string | null }
}

export function toMessageViewModel(
  m: MessageWithGift,
  storage: IStorageRepository
): MessageViewModel {
  return {
    id: m.giftId,
    guestName: m.guestName,
    message: m.message,
    thanked: m.thanked,
    createdAt: m.createdAt.toISOString(),
    gift: {
      name: m.gift.name,
      price: m.gift.price ?? null,
      imageUrl: resolveStorageUrl(m.gift.imagePath, storage),
    },
  }
}
