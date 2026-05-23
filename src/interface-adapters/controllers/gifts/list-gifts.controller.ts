import type { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import { listGiftsUseCase } from '@/src/application/use-cases/gifts/list-gifts.use-case'
import { getContainer } from '@/src/di/container'
import type { Gift } from '@/src/entities/models/gift'

export type GiftView = Gift & { imageUrl: string | null }

const presentGift = (gift: Gift, storage: IStorageRepository): GiftView => ({
  ...gift,
  imageUrl: gift.imagePath
    ? storage.getPublicUrl(gift.imagePath, { width: 600, quality: 75 })
    : null,
})

export async function listGiftsController(): Promise<GiftView[]> {
  const { giftsRepo, storageRepo } = await getContainer()
  const gifts = await listGiftsUseCase({ giftsRepo })()
  return gifts.map((g) => presentGift(g, storageRepo))
}
