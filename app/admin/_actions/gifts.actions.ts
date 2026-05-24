'use server'

import { getContainer } from '@/src/di/container'
import { listGiftsController } from '@/src/interface-adapters/controllers/gifts/list-gifts.controller'
import {
  createGiftController,
  deleteGiftController,
  updateGiftController,
} from '@/src/interface-adapters/controllers/gifts/manage-gift.controller'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'

export type GiftFormActionState =
  | {
      ok: true
      data?: unknown
    }
  | {
      ok: false
      error: string
      issues?: unknown
    }
  | null

const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

function getImageExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase()

  if (fromName && ['jpg', 'jpeg', 'png', 'webp'].includes(fromName)) {
    return fromName
  }

  if (file.type === 'image/png') return 'png'
  if (file.type === 'image/webp') return 'webp'

  return 'jpg'
}

async function uploadGiftImageIfPresent(formData: FormData) {
  const file = formData.get('image') as File | null

  if (!file || file.size === 0) {
    return { imagePath: undefined as string | undefined }
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      error: {
        ok: false as const,
        error: 'Formato de imagem inválido. Use JPG, PNG ou WEBP.',
      },
    }
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      error: {
        ok: false as const,
        error: 'Imagem muito grande. Envie uma imagem de até 5MB.',
      },
    }
  }

  const { storageRepo } = await getContainer()
  const ext = getImageExtension(file)
  const path = `gifts/${randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const uploaded = await storageRepo.upload(buffer, path, file.type)

  return {
    imagePath: uploaded.path,
    cleanup: async () => {
      try {
        await storageRepo.remove(uploaded.path)
      } catch {
        // best effort cleanup
      }
    },
  }
}

function revalidateGiftPaths() {
  revalidatePath('/admin/presentes')
  revalidatePath('/admin/gifts')
  revalidatePath('/presentes')
  revalidatePath('/invite/full')
  revalidatePath('/')
}

export async function createGiftAction(
  _: GiftFormActionState,
  formData: FormData
): Promise<GiftFormActionState> {
  const upload = await uploadGiftImageIfPresent(formData)

  if ('error' in upload && upload.error) {
    return upload.error
  }

  const result = await createGiftController({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    category: formData.get('category'),
    imagePath: upload.imagePath,
  })

  if (!result.ok && upload.cleanup) {
    await upload.cleanup()
  }

  if (result.ok) {
    revalidateGiftPaths()
  }

  return result
}

export async function updateGiftAction(
  _: GiftFormActionState,
  formData: FormData
): Promise<GiftFormActionState> {
  const upload = await uploadGiftImageIfPresent(formData)

  if ('error' in upload && upload.error) {
    return upload.error
  }

  const payload: Record<string, FormDataEntryValue | string | undefined> = {
    id: formData.get('id') ?? undefined,
    name: formData.get('name') ?? undefined,
    description: formData.get('description') ?? undefined,
    price: formData.get('price') ?? undefined,
    category: formData.get('category') ?? undefined,
  }

  /**
   * Important:
   * Only send imagePath when a new file was uploaded.
   * If no file was selected, keep the current DB image_path untouched.
   */
  if (upload.imagePath) {
    payload.imagePath = upload.imagePath
  }

  const result = await updateGiftController(payload)

  if (!result.ok && upload.cleanup) {
    await upload.cleanup()
  }

  if (result.ok) {
    revalidateGiftPaths()
  }

  return result
}

export async function deleteGiftAction(id: string) {
  const result = await deleteGiftController(id)

  if (result.ok) {
    revalidateGiftPaths()
  }

  return result
}

export async function listGiftsAction() {
  return listGiftsController()
}
