export function getString(fd: FormData, key: string, fallback = ''): string {
  const value = fd.get(key)
  return typeof value === 'string' ? value : fallback
}

export function getOptionalString(
  fd: FormData,
  key: string
): string | undefined {
  const value = fd.get(key)
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function getBoolean(fd: FormData, key: string): boolean {
  const value = fd.get(key)
  return value === 'true' || value === 'on'
}

export function getNumber(fd: FormData, key: string): number | undefined {
  const value = fd.get(key)
  if (typeof value !== 'string' || value.length === 0) return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

export function getFile(fd: FormData, key: string): File | null {
  const value = fd.get(key)
  return value instanceof File && value.size > 0 ? value : null
}
