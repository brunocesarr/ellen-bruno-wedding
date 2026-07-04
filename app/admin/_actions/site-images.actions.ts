'use server'

import { getContainer } from '@/src/di/container'
import {
  getBoolean,
  getFile,
  getNumber,
  getString,
} from '@/src/lib/form-data'
import { revalidateGroup } from '@/src/lib/revalidate'
import { uploadImageIfPresent } from '@/src/lib/storage-upload'
import {
  deleteSiteImageController,
  listSiteImagesAdminController,
  upsertSiteImageController,
} from '@/src/interface-adapters/controllers/site-images/manage-site-image.controller'

export async function listSiteImagesAction() {
  return listSiteImagesAdminController()
}

export async function upsertSiteImageAction(_: unknown, formData: FormData) {
  const section = getString(formData, 'section')
  const { storageRepo } = await getContainer()
  const upload = await uploadImageIfPresent(
    storageRepo,
    getFile(formData, 'image'),
    `site/${section}`
  )
  if (!upload.ok) return { ok: false as const, error: upload.error }

  const result = await upsertSiteImageController({
    key: getString(formData, 'key'),
    section,
    alt: getString(formData, 'alt'),
    displayOrder: getNumber(formData, 'displayOrder') ?? 0,
    isActive: getBoolean(formData, 'isActive'),
    imagePath: upload.imagePath, // undefined → keeps existing image
  })

  if (!result.ok) await upload.cleanup?.()
  else revalidateGroup('siteImages')

  return result
}

export async function clearSiteImageAction(key: string) {
  const result = await deleteSiteImageController(key, 'clear')
  if (result.ok) revalidateGroup('siteImages')
  return result
}

export async function deleteSiteImageAction(key: string) {
  const result = await deleteSiteImageController(key, 'delete')
  if (result.ok) revalidateGroup('siteImages')
  return result
}
