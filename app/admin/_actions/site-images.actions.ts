'use server'

import { getContainer } from '@/src/di/container'
import {
  deleteSiteImageController,
  listSiteImagesAdminController,
  upsertSiteImageController,
} from '@/src/interface-adapters/controllers/site-images/manage-site-image.controller'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'

export async function listSiteImagesAction() {
  return listSiteImagesAdminController()
}

export async function upsertSiteImageAction(_: unknown, formData: FormData) {
  const key = formData.get('key') as string
  const section = formData.get('section') as string
  const alt = (formData.get('alt') as string) ?? ''
  const displayOrder = formData.get('displayOrder') ?? 0
  const isActive =
    formData.get('isActive') === 'on' || formData.get('isActive') === 'true'

  const file = formData.get('image') as File | null
  let imagePath: string | undefined

  if (file && file.size > 0) {
    const { storageRepo } = await getContainer()
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `site/${section}/${randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const uploaded = await storageRepo.upload(buffer, path, file.type)
    imagePath = uploaded.path
  }

  const result = await upsertSiteImageController({
    key,
    section,
    alt,
    displayOrder,
    isActive,
    imagePath, // undefined if no new file → keeps existing image
  })

  if (result.ok) {
    revalidatePath('/admin/imagens')
    revalidatePath('/', 'layout')
  }
  return result
}

export async function clearSiteImageAction(key: string) {
  const result = await deleteSiteImageController(key, 'clear')
  if (result.ok) {
    revalidatePath('/admin/imagens')
    revalidatePath('/', 'layout')
  }
  return result
}

export async function deleteSiteImageAction(key: string) {
  const result = await deleteSiteImageController(key, 'delete')
  if (result.ok) {
    revalidatePath('/admin/imagens')
    revalidatePath('/', 'layout')
  }
  return result
}
