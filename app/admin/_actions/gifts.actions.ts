'use server'
import { getContainer } from '@/src/di/container'
import { listGiftsAdminController } from '@/src/interface-adapters/controllers/gifts/list-gifts.controller'
import {
  createGiftController,
  deleteGiftController,
  updateGiftController,
} from '@/src/interface-adapters/controllers/gifts/manage-gift.controller'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'

export async function createGiftAction(_: unknown, formData: FormData) {
  const file = formData.get('image') as File | null
  let imagePath: string | undefined

  if (file && file.size > 0) {
    const { storageRepo } = await getContainer()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `gifts/${randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploaded = await storageRepo.upload(buffer, path, file.type)
    imagePath = uploaded.path
  }

  const result = await createGiftController({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    imagePath,
  })
  if (result.ok) {
    revalidatePath('/admin/gifts')
    revalidatePath('/presentes')
  }
  return result
}

export async function updateGiftAction(_: unknown, formData: FormData) {
  const result = await updateGiftController({
    id: formData.get('id'),
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
  })
  if (result.ok) revalidatePath('/admin/gifts')
  return result
}

export async function deleteGiftAction(id: string) {
  const result = await deleteGiftController(id)
  if (result.ok) {
    revalidatePath('/admin/gifts')
    revalidatePath('/presentes')
  }
  return result
}

export async function listGiftsAdminAction() {
  return listGiftsAdminController()
}
