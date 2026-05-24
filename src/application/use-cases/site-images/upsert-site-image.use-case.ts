import type { ISiteImagesRepository } from '@/src/application/repositories/site-images.repository.interface'
import type { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import { UpsertSiteImageInputSchema } from '@/src/entities/models/site-image'

type Deps = {
  siteImagesRepo: ISiteImagesRepository
  storageRepo: IStorageRepository
  authService: IAuthService
}

export function upsertSiteImageUseCase(d: Deps) {
  return async (raw: unknown) => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()
    const result = UpsertSiteImageInputSchema.safeParse(raw)
    if (!result.success) throw new ValidationError(result.error.flatten())

    const next = result.data
    const previous = await d.siteImagesRepo.getByKey(next.key)

    // If a NEW image was uploaded, delete the previous storage object (best-effort)
    if (
      previous?.imagePath &&
      next.imagePath &&
      previous.imagePath !== next.imagePath
    ) {
      try {
        await d.storageRepo.remove(previous.imagePath)
      } catch {
        /* best-effort cleanup */
      }
    }

    return d.siteImagesRepo.upsert(next)
  }
}
