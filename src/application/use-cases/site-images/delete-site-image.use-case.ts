import type { ISiteImagesRepository } from '@/src/application/repositories/site-images.repository.interface'
import type { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'

type Deps = {
  siteImagesRepo: ISiteImagesRepository
  storageRepo: IStorageRepository
  authService: IAuthService
}

export function deleteSiteImageUseCase(d: Deps) {
  return async (key: string, mode: 'clear' | 'delete' = 'clear') => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()

    const existing = await d.siteImagesRepo.getByKey(key)
    if (existing?.imagePath) {
      try {
        await d.storageRepo.remove(existing.imagePath)
      } catch {}
    }

    if (mode === 'delete') return d.siteImagesRepo.deleteByKey(key)
    return d.siteImagesRepo.clearImage(key)
  }
}
