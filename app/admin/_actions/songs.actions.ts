'use server'

import {
  createSongController,
  deleteSongController,
  listSongsAdminController,
  reorderSongsController,
} from '@/src/interface-adapters/controllers/songs/manage-song.controller'
import { getString } from '@/src/lib/form-data'
import { revalidateGroup } from '@/src/lib/revalidate'

export async function listSongsAction() {
  return listSongsAdminController()
}

export async function createSongAction(_: unknown, formData: FormData) {
  const audioPath = getString(formData, 'audioPath')
  if (!audioPath) {
    return { ok: false as const, error: 'Selecione um arquivo de áudio.' }
  }

  const result = await createSongController({
    title: getString(formData, 'title'),
    audioPath,
  })

  if (result.ok) revalidateGroup('music')

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
