import type { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import { TypedSupabaseClient } from '../supabase/types'

export class SupabaseStorageRepository implements IStorageRepository {
  constructor(
    private readonly client: TypedSupabaseClient,
    private readonly bucket: string
  ) {}

  async upload(file: File | Buffer, path: string, contentType?: string) {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .upload(path, file, {
        upsert: true,
        contentType:
          contentType ??
          (file instanceof File ? file.type : 'application/octet-stream'),
        // Paths are always randomUUID-named (see storage-upload.ts) — content
        // at a given path never changes, so it's safe to cache indefinitely.
        cacheControl: '31536000',
      })
    if (error) throw error
    return { path: data.path }
  }

  async remove(path: string) {
    const { error } = await this.client.storage.from(this.bucket).remove([path])
    if (error) throw error
  }

  getPublicUrl(path: string, _options?: { width?: number; quality?: number }) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!
    return `${base}/storage/v1/object/public/${this.bucket}/${path}`
  }
}
