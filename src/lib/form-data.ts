/**
 * Typed helpers for reading `FormData` in server actions.
 *
 * These normalize the raw `FormData.get` return (`string | File | null`) into
 * predictable values. Deep validation still happens downstream via Zod in the
 * use-case layer — these helpers only shape the payload.
 */

/** Returns the string value, or `fallback` when absent/non-string. */
export function getString(fd: FormData, key: string, fallback = ''): string {
  const value = fd.get(key)
  return typeof value === 'string' ? value : fallback
}

/** Returns the string value, or `undefined` when absent or empty. */
export function getOptionalString(
  fd: FormData,
  key: string
): string | undefined {
  const value = fd.get(key)
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/** Interprets checkbox-style values (`'true'` / `'on'`) as booleans. */
export function getBoolean(fd: FormData, key: string): boolean {
  const value = fd.get(key)
  return value === 'true' || value === 'on'
}

/** Parses a numeric field, returning `undefined` when absent or invalid. */
export function getNumber(fd: FormData, key: string): number | undefined {
  const value = fd.get(key)
  if (typeof value !== 'string' || value.length === 0) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

/** Returns an uploaded file only when one with content is present. */
export function getFile(fd: FormData, key: string): File | null {
  const value = fd.get(key)
  return value instanceof File && value.size > 0 ? value : null
}
