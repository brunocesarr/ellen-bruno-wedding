import type { ISiteImagesRepository } from '@/src/application/repositories/site-images.repository.interface'
import type { SiteImage } from '@/src/entities/models/site-image'

export function listPublicSiteImagesUseCase(d: {
  siteImagesRepo: ISiteImagesRepository
}) {
  return async (): Promise<SiteImage[]> => d.siteImagesRepo.listActive()
}
