import type { ISiteImagesRepository } from '@/src/application/repositories/site-images.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'

type Deps = { siteImagesRepo: ISiteImagesRepository; authService: IAuthService }

export function listSiteImagesAdminUseCase(d: Deps) {
  return async () => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()
    return d.siteImagesRepo.list()
  }
}
