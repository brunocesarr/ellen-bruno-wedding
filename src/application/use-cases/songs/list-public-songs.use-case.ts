import type { ISongsRepository } from '@/src/application/repositories/songs.repository.interface'
import type { Song } from '@/src/entities/models/song'

export function listPublicSongsUseCase(d: { songsRepo: ISongsRepository }) {
  return async (): Promise<Song[]> => d.songsRepo.list()
}
