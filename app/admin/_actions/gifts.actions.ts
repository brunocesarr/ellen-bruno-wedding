'use server'

import { getContainer } from '@/src/di/container'
import { listGiftsController } from '@/src/interface-adapters/controllers/gifts/list-gifts.controller'
import {
  createGiftController,
  deleteGiftController,
  updateGiftController,
} from '@/src/interface-adapters/controllers/gifts/manage-gift.controller'
import { getFile, getOptionalString } from '@/src/lib/form-data'
import { revalidateGroup } from '@/src/lib/revalidate'
import type { ActionResult } from '@/src/lib/server-action-result'
import { uploadImageIfPresent } from '@/src/lib/storage-upload'

type GiftMutationResult = ActionResult<{ id: string; name: string }>

export type GiftFormActionState = GiftMutationResult | null

export async function createGiftAction(
  _: unknown,
  formData: FormData
): Promise<GiftMutationResult> {
  const { storageRepo } = await getContainer()
  const upload = await uploadImageIfPresent(
    storageRepo,
    getFile(formData, 'image'),
    'gifts'
  )
  if (!upload.ok) return { ok: false, error: upload.error }

  const result = await createGiftController({
    name: getOptionalString(formData, 'name'),
    description: getOptionalString(formData, 'description'),
    price: getOptionalString(formData, 'price'),
    category: getOptionalString(formData, 'category'),
    imagePath: upload.imagePath,
  })

  if (!result.ok) await upload.cleanup?.()
  else revalidateGroup('gifts')

  return result
}

export async function updateGiftAction(
  _: unknown,
  formData: FormData
): Promise<GiftMutationResult> {
  const { storageRepo } = await getContainer()
  const upload = await uploadImageIfPresent(
    storageRepo,
    getFile(formData, 'image'),
    'gifts'
  )
  if (!upload.ok) return { ok: false, error: upload.error }

  const result = await updateGiftController({
    id: getOptionalString(formData, 'id'),
    name: getOptionalString(formData, 'name'),
    description: getOptionalString(formData, 'description'),
    price: getOptionalString(formData, 'price'),
    category: getOptionalString(formData, 'category'),

    ...(upload.imagePath ? { imagePath: upload.imagePath } : {}),
  })

  if (!result.ok) await upload.cleanup?.()
  else revalidateGroup('gifts')

  return result
}

export async function deleteGiftAction(id: string) {
  const result = await deleteGiftController(id)
  if (result.ok) revalidateGroup('gifts')
  return result
}

export async function listGiftsAction() {
  return listGiftsController()
}
