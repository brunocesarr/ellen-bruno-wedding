import 'server-only'

import type { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

/**
 * Longest edge kept for stored originals. Matches the largest `deviceSizes`
 * entry in next.config.ts — anything bigger can never be rendered, it would
 * only be bytes the image optimizer pulls out of Supabase Storage and throws
 * away. Free-tier Supabase has no image transformations (see
 * SupabaseStorageRepository.getPublicUrl), so whatever we store here is the
 * full payload of every optimizer fetch.
 */
const MAX_STORED_EDGE = 1920

/** Source quality for the optimizer to re-encode from, not what users receive. */
const WEBP_QUALITY = 82

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

type ProcessedImage = { buffer: Buffer; extension: string; contentType: string }

function resolveExtension(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase()
  if (fromName && ['jpg', 'jpeg', 'png', 'webp'].includes(fromName)) {
    return fromName
  }
  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'
  return 'jpg'
}

/**
 * Downscales to `MAX_STORED_EDGE` and re-encodes to WebP. `.rotate()` with no
 * argument applies the EXIF orientation before that metadata gets dropped —
 * without it, photos straight off a phone are stored sideways.
 *
 * Degrades to the untouched original if sharp cannot read the file, so a codec
 * we did not anticipate fails as a slightly-too-large image rather than as a
 * broken admin upload.
 */
async function processImage(
  file: File,
  original: Buffer
): Promise<ProcessedImage> {
  try {
    const buffer = await sharp(original)
      .rotate()
      .resize({
        width: MAX_STORED_EDGE,
        height: MAX_STORED_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()

    return { buffer, extension: 'webp', contentType: 'image/webp' }
  } catch (error) {
    console.error(
      '[uploadImageIfPresent] sharp failed, storing original:',
      error
    )

    return {
      buffer: original,
      extension: resolveExtension(file),
      contentType: file.type,
    }
  }
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

  const original = Buffer.from(await file.arrayBuffer())
  const processed = await processImage(file, original)

  const path = `${pathPrefix}/${randomUUID()}.${processed.extension}`
  const uploaded = await storageRepo.upload(
    processed.buffer,
    path,
    processed.contentType
  )

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
