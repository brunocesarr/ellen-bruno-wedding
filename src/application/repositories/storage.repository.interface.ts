export interface IStorageRepository {
  upload(
    file: File | Buffer,
    path: string,
    contentType?: string
  ): Promise<{ path: string }>
  remove(path: string): Promise<void>
  /** Raw bytes of an object — used to bundle private documents into a zip. */
  download(path: string): Promise<Buffer>
  getPublicUrl(
    path: string,
    options?: { width?: number; quality?: number }
  ): string
  /**
   * Time-limited URL for an object in a *private* bucket. Only
   * `wedding-documents` needs this today — the image/audio buckets are
   * public-read, where `getPublicUrl` is both cheaper and cacheable.
   */
  createSignedUrl(path: string, expiresInSeconds: number): Promise<string>
}
