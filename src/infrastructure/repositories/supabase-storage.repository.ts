import type { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import { TypedSupabaseClient } from '../supabase/types'

const BUCKET = 'wedding-images'

export class SupabaseStorageRepository implements IStorageRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async upload(file: File | Buffer, path: string, contentType?: string) {
    const { data, error } = await this.client.storage
      .from(BUCKET)
      .upload(path, file, {
        upsert: true,
        contentType:
          contentType ??
          (file instanceof File ? file.type : 'application/octet-stream'),
      })
    if (error) throw error
    return { path: data.path }
  }

  async remove(path: string) {
    const { error } = await this.client.storage.from(BUCKET).remove([path])
    if (error) throw error
  }

  getPublicUrl(
    path: string,
    _options?: { width?: number; quality?: number }
  ) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
    return `${base}/storage/v1/object/public/${BUCKET}/${path}`
  }
}
