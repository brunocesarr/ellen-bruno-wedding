import 'server-only'

import type { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import { randomUUID } from 'crypto'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

function resolveExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && ['jpg', 'jpeg', 'png', 'webp'].includes(fromName)) {
    return fromName
  }
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

export type UploadResult =
  | { ok: true; imagePath?: string; cleanup?: () => Promise<void> }
  | { ok: false; error: string }

/**
 * Validates and uploads an optional image to storage under `<pathPrefix>/<uuid>.<ext>`.
 *
 * - No file / empty file → `{ ok: true, imagePath: undefined }` (caller keeps existing image).
 * - Invalid type or oversized → `{ ok: false, error }`.
 * - Success → `{ ok: true, imagePath, cleanup }`; call `cleanup()` to remove the
 *   uploaded object if the surrounding mutation later fails.
 */
export async function uploadImageIfPresent(
  storageRepo: IStorageRepository,
  file: File | null,
  pathPrefix: string
): Promise<UploadResult> {
  if (!file || file.size === 0) return { ok: true, imagePath: undefined }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { ok: false, error: 'Formato de imagem inválido. Use JPG, PNG ou WEBP.' }
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, error: 'Imagem muito grande. Envie uma imagem de até 5MB.' }
  }

  const path = `${pathPrefix}/${randomUUID()}.${resolveExtension(file)}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const uploaded = await storageRepo.upload(buffer, path, file.type)

  return {
    imagePath: uploaded.path,
    ok: true,
    cleanup: async () => {
      try {
        await storageRepo.remove(uploaded.path)
      } catch {
        // best-effort cleanup
      }
    },
  }
}
