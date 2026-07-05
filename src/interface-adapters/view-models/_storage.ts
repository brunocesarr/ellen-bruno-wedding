import { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'

export function resolveStorageUrl(
  path: string | null | undefined,
  storage: IStorageRepository
): string | null {
  if (!path) return null

  return storage.getPublicUrl(path, { width: 1920, quality: 75 })
}
