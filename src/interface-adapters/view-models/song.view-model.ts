import { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import type { Song } from '@/src/entities/models/song'
import { resolveStorageUrl } from './_storage'

export type SongViewModel = {
  id: string
  title: string
  audioUrl: string | null
  displayOrder: number
}

export function toSongViewModel(
  s: Song,
  storage: IStorageRepository
): SongViewModel {
  return {
    id: s.id,
    title: s.title,
    audioUrl: resolveStorageUrl(s.audioPath, storage),
    displayOrder: s.displayOrder,
  }
}
