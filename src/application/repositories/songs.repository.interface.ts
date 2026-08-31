import type { CreateSongInput, Song } from '@/src/entities/models/song'

export interface ISongsRepository {
  list(): Promise<Song[]>
  getById(id: string): Promise<Song | null>
  create(input: CreateSongInput): Promise<Song>
  delete(id: string): Promise<Song | null>
  reorder(orderedIds: string[]): Promise<void>
}
