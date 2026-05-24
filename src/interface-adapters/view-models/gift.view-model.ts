import { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import type {
  GiftWithStatus,
  ReservationStatus,
} from '@/src/entities/models/dashboard'
import { GiftCategory } from '@/src/entities/models/gift'
import { resolveStorageUrl } from './_storage'

export type GiftViewModel = {
  id: string
  name: string
  description: string | null
  category: GiftCategory | null
  price: number
  imageUrl: string | null
  status: ReservationStatus
  reservedBy: string | null
  reservedByEmail: string | null
  reservedAt: string | null
  reservedMessage: string | null
}

export function toGiftViewModel(
  g: GiftWithStatus,
  storage: IStorageRepository
): GiftViewModel {
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    category: g.category,
    price: g.price,
    imageUrl: resolveStorageUrl(g.imagePath, storage),
    status: g.status,
    reservedBy: g.reservedByName,
    reservedByEmail: g.reservedByEmail,
    reservedAt: g.reservedAt ? g.reservedAt.toISOString() : null,
    reservedMessage: g.reservedMessage,
  }
}
