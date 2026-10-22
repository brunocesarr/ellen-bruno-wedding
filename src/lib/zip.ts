import { zipSync } from 'fflate'

export type ZipEntry = { folder: string; fileName: string; data: Uint8Array }

/** Characters Windows/macOS reject (or treat as separators) in a file name. */
const safe = (name: string) =>
  name
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim() || 'arquivo'

/**
 * Level 0 (store): the inputs are already-compressed JPG/WEBP/PDF, so
 * deflating them again burns CPU on a time-capped serverless function for
 * almost no size win.
 */
export function zipFiles(entries: ZipEntry[]): Uint8Array {
  const tree: Record<string, Uint8Array> = {}
  for (const e of entries) {
    tree[`${safe(e.folder)}/${safe(e.fileName)}`] = e.data
  }
  return zipSync(tree, { level: 0 })
}

export { safe as safeFileName }
