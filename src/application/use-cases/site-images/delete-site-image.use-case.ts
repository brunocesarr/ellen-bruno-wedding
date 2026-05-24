import type { ISiteImagesRepository } from '@/src/application/repositories/site-images.repository.interface'
import type { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'

type Deps = {
  siteImagesRepo: ISiteImagesRepository
  storageRepo: IStorageRepository
  authService: IAuthService
}

/**
 * Two flavors:
 *  - mode='clear'  → keeps the row but removes the image (component falls back)
 *  - mode='delete' → removes both the storage object and the row entirely
 */
export function deleteSiteImageUseCase(d: Deps) {
  return async (key: string, mode: 'clear' | 'delete' = 'clear') => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()

    const existing = await d.siteImagesRepo.getByKey(key)
    if (existing?.imagePath) {
      try {
        await d.storageRepo.remove(existing.imagePath)
      } catch {
        /* ignore */
      }
    }

    if (mode === 'delete') return d.siteImagesRepo.deleteByKey(key)
    return d.siteImagesRepo.clearImage(key)
  }
}
