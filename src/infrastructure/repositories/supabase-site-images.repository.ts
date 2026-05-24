import type { ISiteImagesRepository } from '@/src/application/repositories/site-images.repository.interface'
import type {
  SiteImage,
  UpsertSiteImageInput,
} from '@/src/entities/models/site-image'
import type {
  SiteImageInsert,
  SiteImageRow,
  SiteImageUpdate,
} from '@/src/infrastructure/supabase/db-types'
import type { TypedSupabaseClient } from '@/src/infrastructure/supabase/types'

const mapRow = (r: SiteImageRow): SiteImage => ({
  id: r.id,
  key: r.key,
  section: r.section,
  imagePath: r.image_path,
  alt: r.alt,
  displayOrder: r.display_order ?? 0,
  isActive: r.is_active ?? true,
  updatedAt: new Date(r.updated_at ?? Date.now()),
})

export class SupabaseSiteImagesRepository implements ISiteImagesRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async list(): Promise<SiteImage[]> {
    const { data, error } = await this.client
      .from('site_images')
      .select('*')
      .order('section', { ascending: true })
      .order('display_order', { ascending: true })
    if (error) throw error
    return (data ?? []).map(mapRow)
  }

  async listActive(): Promise<SiteImage[]> {
    const { data, error } = await this.client
      .from('site_images')
      .select('*')
      .eq('is_active', true)
    if (error) throw error
    return (data ?? []).map(mapRow)
  }

  async getByKey(key: string): Promise<SiteImage | null> {
    const { data, error } = await this.client
      .from('site_images')
      .select('*')
      .eq('key', key)
      .maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }

  async upsert(input: UpsertSiteImageInput): Promise<SiteImage> {
    const payload = {
      key: input.key,
      section: input.section,
      image_path: input.imagePath ?? null,
      alt: input.alt ?? null,
      display_order: input.displayOrder,
      is_active: input.isActive,
    } satisfies SiteImageInsert

    const { data, error } = await this.client
      .from('site_images')
      .upsert(payload, { onConflict: 'key' })
      .select()
      .single()
    if (error) throw error
    return mapRow(data)
  }

  async clearImage(key: string): Promise<SiteImage | null> {
    const payload: SiteImageUpdate = { image_path: null }
    const { data, error } = await this.client
      .from('site_images')
      .update(payload)
      .eq('key', key)
      .select()
      .maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }

  async deleteByKey(key: string): Promise<SiteImage | null> {
    const { data, error } = await this.client
      .from('site_images')
      .delete()
      .eq('key', key)
      .select()
      .maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }
}
