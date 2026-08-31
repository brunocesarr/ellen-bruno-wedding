'use server'

import { getContainer } from '@/src/di/container'
import {
  createSongController,
  deleteSongController,
  listSongsAdminController,
  reorderSongsController,
} from '@/src/interface-adapters/controllers/songs/manage-song.controller'
import { getFile, getString } from '@/src/lib/form-data'
import { revalidateGroup } from '@/src/lib/revalidate'
import { uploadAudioIfPresent } from '@/src/lib/storage-upload'

export async function listSongsAction() {
  return listSongsAdminController()
}

export async function createSongAction(_: unknown, formData: FormData) {
  const { audioStorageRepo } = await getContainer()
  const upload = await uploadAudioIfPresent(
    audioStorageRepo,
    getFile(formData, 'audio'),
    'songs'
  )
  if (!upload.ok) return { ok: false as const, error: upload.error }
  if (!upload.audioPath) {
    return { ok: false as const, error: 'Selecione um arquivo de áudio.' }
  }

  const result = await createSongController({
    title: getString(formData, 'title'),
    audioPath: upload.audioPath,
  })

  if (!result.ok) await upload.cleanup?.()
  else revalidateGroup('music')

  return result
}

export async function deleteSongAction(id: string) {
  const result = await deleteSongController(id)
  if (result.ok) revalidateGroup('music')
  return result
}

export async function reorderSongsAction(orderedIds: string[]) {
  const result = await reorderSongsController(orderedIds)
  if (result.ok) revalidateGroup('music')
  return result
}
