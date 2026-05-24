import type {
  SiteImage,
  UpsertSiteImageInput,
} from '@/src/entities/models/site-image'

export interface ISiteImagesRepository {
  list(): Promise<SiteImage[]>
  listActive(): Promise<SiteImage[]>
  getByKey(key: string): Promise<SiteImage | null>
  upsert(input: UpsertSiteImageInput): Promise<SiteImage>
  deleteByKey(key: string): Promise<SiteImage | null>
  clearImage(key: string): Promise<SiteImage | null>
}
