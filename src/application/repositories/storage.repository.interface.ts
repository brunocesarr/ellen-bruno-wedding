export interface IStorageRepository {
  upload(
    file: File | Buffer,
    path: string,
    contentType?: string
  ): Promise<{ path: string }>
  remove(path: string): Promise<void>
  getPublicUrl(
    path: string,
    options?: { width?: number; quality?: number }
  ): string
}
