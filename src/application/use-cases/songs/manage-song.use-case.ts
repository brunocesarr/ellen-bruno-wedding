import type { ISongsRepository } from '@/src/application/repositories/songs.repository.interface'
import type { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import { CreateSongInputSchema } from '@/src/entities/models/song'

type Deps = {
  songsRepo: ISongsRepository
  storageRepo: IStorageRepository
  authService: IAuthService
}

export function createSongUseCase(d: Deps) {
  return async (raw: unknown) => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()

    const result = CreateSongInputSchema.safeParse(raw)
    if (!result.success) throw new ValidationError(result.error.flatten())

    const existing = await d.songsRepo.list()
    const nextOrder =
      existing.reduce((max, s) => Math.max(max, s.displayOrder), -1) + 1

    return d.songsRepo.create({ ...result.data, displayOrder: nextOrder })
  }
}

export function deleteSongUseCase(d: Deps) {
  return async (id: string) => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()

    const existing = await d.songsRepo.getById(id)
    if (existing?.audioPath) {
      try {
        await d.storageRepo.remove(existing.audioPath)
      } catch {}
    }

    return d.songsRepo.delete(id)
  }
}

export function reorderSongsUseCase(d: Deps) {
  return async (orderedIds: string[]) => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()
    return d.songsRepo.reorder(orderedIds)
  }
}
