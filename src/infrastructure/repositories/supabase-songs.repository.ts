import type { ISongsRepository } from '@/src/application/repositories/songs.repository.interface'
import type { CreateSongInput, Song } from '@/src/entities/models/song'
import type {
  SongInsert,
  SongRow,
} from '@/src/infrastructure/supabase/db-types'
import type { TypedSupabaseClient } from '@/src/infrastructure/supabase/types'

const mapRow = (r: SongRow): Song => ({
  id: r.id,
  title: r.title,
  audioPath: r.audio_path,
  displayOrder: r.display_order ?? 0,
  createdAt: new Date(r.created_at ?? Date.now()),
  updatedAt: new Date(r.updated_at ?? Date.now()),
})

export class SupabaseSongsRepository implements ISongsRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async list(): Promise<Song[]> {
    const { data, error } = await this.client
      .from('songs')
      .select('*')
      .order('display_order', { ascending: true })
    if (error) throw error
    return (data ?? []).map(mapRow)
  }

  async getById(id: string): Promise<Song | null> {
    const { data, error } = await this.client
      .from('songs')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }

  async create(input: CreateSongInput): Promise<Song> {
    const payload = {
      title: input.title,
      audio_path: input.audioPath,
      display_order: input.displayOrder,
    } satisfies SongInsert

    const { data, error } = await this.client
      .from('songs')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return mapRow(data)
  }

  async delete(id: string): Promise<Song | null> {
    const { data, error } = await this.client
      .from('songs')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const results = await Promise.all(
      orderedIds.map((id, index) =>
        this.client.from('songs').update({ display_order: index }).eq('id', id)
      )
    )
    const failed = results.find((r) => r.error)
    if (failed?.error) throw failed.error
  }
}
