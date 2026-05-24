import { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import type { SiteImage } from '@/src/entities/models/site-image'
import { resolveStorageUrl } from './_storage'

export type SiteImageViewModel = {
  id: string
  key: string
  section: string
  imageUrl: string | null
  imagePath: string | null
  alt: string | null
  displayOrder: number
  isActive: boolean
  updatedAt: string
}

export function toSiteImageViewModel(
  s: SiteImage,
  storage: IStorageRepository
): SiteImageViewModel {
  return {
    id: s.id,
    key: s.key,
    section: s.section,
    imageUrl: resolveStorageUrl(s.imagePath, storage),
    imagePath: s.imagePath,
    alt: s.alt,
    displayOrder: s.displayOrder,
    isActive: s.isActive,
    updatedAt: s.updatedAt.toISOString(),
  }
}
