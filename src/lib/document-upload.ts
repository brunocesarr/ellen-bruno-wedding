import 'server-only'

import type { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import {
  EXPENSE_DOCUMENT_ACCEPTED_TYPES,
  MAX_EXPENSE_DOCUMENT_ORIGINAL_BYTES,
  MAX_EXPENSE_DOCUMENT_STORED_BYTES,
} from '@/src/lib/constants'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

/**
 * Longest edge kept for a scanned/photographed document. Deliberately smaller
 * than storage-upload.ts's 1920: nobody zooms a contract past reading size,
 * and these files are never served through the Next image optimizer, so
 * whatever is stored here is exactly what the browser downloads on every view.
 */
const MAX_STORED_EDGE = 1600

/**
 * Lower than the 82 used for gallery photos. Text and stamps survive this
 * fine; gradients would not, and there are none in a contract scan.
 */
const WEBP_QUALITY = 72

const ACCEPTED = new Set<string>(EXPENSE_DOCUMENT_ACCEPTED_TYPES)

export type ExpenseDocumentUpload = {
  filePath: string
  fileName: string
  mimeType: string
  sizeBytes: number
  /** Removes the just-stored bytes when the metadata write fails afterwards. */
  cleanup: () => Promise<void>
}

export type ExpenseDocumentUploadResult =
  { ok: true; document: ExpenseDocumentUpload } | { ok: false; error: string }

/** Keeps the original name recognisable in the UI without trusting its bytes. */
function safeFileName(name: string, extension: string): string {
  const base =
    name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^\p{L}\p{N} ._-]/gu, '')
      .trim()
      .slice(0, 120) || 'documento'
  return `${base}.${extension}`
}

/**
 * Downscales and re-encodes to WebP. `.rotate()` with no argument applies EXIF
 * orientation before the metadata is dropped — without it a contract photographed
 * in portrait is stored sideways.
 *
 * Unlike storage-upload.ts this does *not* fall back to the untouched original:
 * an unreadable image here would be a document nobody can read either, and
 * silently storing it spends the free-tier budget on bytes of no use.
 */
async function compressImage(
  original: Buffer
): Promise<{ buffer: Buffer; extension: string; mimeType: string }> {
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

  return { buffer, extension: 'webp', mimeType: 'image/webp' }
}

/**
 * Uploads one expense document (contract or comprovante) into the private
 * `wedding-documents` bucket.
 *
 * Callers follow the same ordering as `uploadImageIfPresent`: upload first,
 * write the row through the controller, and `await cleanup()` if that write
 * fails — including when it fails on the storage quota check.
 */
export async function uploadExpenseDocument(
  storageRepo: IStorageRepository,
  file: File | null,
  expenseId: string
): Promise<ExpenseDocumentUploadResult> {
  if (!file || file.size === 0) {
    return { ok: false, error: 'Selecione um arquivo.' }
  }

  if (!ACCEPTED.has(file.type)) {
    return { ok: false, error: 'Formato inválido. Use PDF, JPG, PNG ou WEBP.' }
  }

  const isPdf = file.type === 'application/pdf'

  // A PDF is stored byte-for-byte (nothing re-encodes it server-side), so it
  // has to already be within the bucket's limit. An image only has to be
  // within the pre-compression ceiling.
  const inputLimit = isPdf
    ? MAX_EXPENSE_DOCUMENT_STORED_BYTES
    : MAX_EXPENSE_DOCUMENT_ORIGINAL_BYTES

  if (file.size > inputLimit) {
    return {
      ok: false,
      error: isPdf
        ? 'PDF muito grande. Envie um arquivo de até 4 MB.'
        : 'Imagem muito grande. Envie uma imagem de até 20 MB.',
    }
  }

  const original = Buffer.from(await file.arrayBuffer())

  let payload: { buffer: Buffer; extension: string; mimeType: string }
  if (isPdf) {
    payload = {
      buffer: original,
      extension: 'pdf',
      mimeType: 'application/pdf',
    }
  } else {
    try {
      payload = await compressImage(original)
    } catch (error) {
      console.error('[uploadExpenseDocument] sharp failed:', error)
      return {
        ok: false,
        error: 'Não foi possível processar a imagem. Tente outro arquivo.',
      }
    }
  }

  if (payload.buffer.byteLength > MAX_EXPENSE_DOCUMENT_STORED_BYTES) {
    return {
      ok: false,
      error:
        'Arquivo muito grande mesmo após a compressão. Reduza a qualidade.',
    }
  }

  const path = `expenses/${expenseId}/${randomUUID()}.${payload.extension}`
  const uploaded = await storageRepo.upload(
    payload.buffer,
    path,
    payload.mimeType
  )

  return {
    ok: true,
    document: {
      filePath: uploaded.path,
      fileName: safeFileName(file.name, payload.extension),
      mimeType: payload.mimeType,
      sizeBytes: payload.buffer.byteLength,
      cleanup: async () => {
        try {
          await storageRepo.remove(uploaded.path)
        } catch {}
      },
    },
  }
}
