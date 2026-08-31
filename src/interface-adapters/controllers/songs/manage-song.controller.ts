import { listSongsAdminUseCase } from '@/src/application/use-cases/songs/list-songs-admin.use-case'
import {
  createSongUseCase,
  deleteSongUseCase,
  reorderSongsUseCase,
} from '@/src/application/use-cases/songs/manage-song.use-case'
import { getContainer } from '@/src/di/container'
import {
  toSongViewModel,
  type SongViewModel,
} from '@/src/interface-adapters/view-models/song.view-model'
import { handle } from '../_handle'

export async function listSongsAdminController() {
  const c = await getContainer()
  return handle(async (): Promise<SongViewModel[]> => {
    const list = await listSongsAdminUseCase(c)()
    return list.map((s) => toSongViewModel(s, c.audioStorageRepo))
  })
}

export async function createSongController(input: unknown) {
  const c = await getContainer()
  return handle(async () => {
    const result = await createSongUseCase(c)(input)
    return toSongViewModel(result, c.audioStorageRepo)
  })
}

export async function deleteSongController(id: string) {
  const c = await getContainer()
  return handle(() => deleteSongUseCase(c)(id))
}

export async function reorderSongsController(orderedIds: string[]) {
  const c = await getContainer()
  return handle(() => reorderSongsUseCase(c)(orderedIds))
}
