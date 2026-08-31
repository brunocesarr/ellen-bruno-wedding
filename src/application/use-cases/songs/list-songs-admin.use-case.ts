import type { ISongsRepository } from '@/src/application/repositories/songs.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'

type Deps = { songsRepo: ISongsRepository; authService: IAuthService }

export function listSongsAdminUseCase(d: Deps) {
  return async () => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()
    return d.songsRepo.list()
  }
}
