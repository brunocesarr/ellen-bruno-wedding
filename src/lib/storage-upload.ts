import 'server-only'

import type { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import { randomUUID } from 'crypto'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const MAX_AUDIO_SIZE = 15 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

const ALLOWED_AUDIO_TYPES = new Set(['audio/mpeg', 'audio/mp3'])

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

export async function uploadImageIfPresent(
  storageRepo: IStorageRepository,
  file: File | null,
  pathPrefix: string
): Promise<UploadResult> {
  if (!file || file.size === 0) return { ok: true, imagePath: undefined }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      ok: false,
      error: 'Formato de imagem inválido. Use JPG, PNG ou WEBP.',
    }
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      ok: false,
      error: 'Imagem muito grande. Envie uma imagem de até 5MB.',
    }
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
      } catch {}
    },
  }
}

export type AudioUploadResult =
  | { ok: true; audioPath?: string; cleanup?: () => Promise<void> }
  | { ok: false; error: string }

export async function uploadAudioIfPresent(
  storageRepo: IStorageRepository,
  file: File | null,
  pathPrefix: string
): Promise<AudioUploadResult> {
  if (!file || file.size === 0) return { ok: true, audioPath: undefined }

  if (!ALLOWED_AUDIO_TYPES.has(file.type)) {
    return { ok: false, error: 'Formato de áudio inválido. Use MP3.' }
  }
  if (file.size > MAX_AUDIO_SIZE) {
    return {
      ok: false,
      error: 'Arquivo muito grande. Envie um áudio de até 15MB.',
    }
  }

  const path = `${pathPrefix}/${randomUUID()}.mp3`
  const buffer = Buffer.from(await file.arrayBuffer())
  const uploaded = await storageRepo.upload(buffer, path, file.type)

  return {
    audioPath: uploaded.path,
    ok: true,
    cleanup: async () => {
      try {
        await storageRepo.remove(uploaded.path)
      } catch {}
    },
  }
}
