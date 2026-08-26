export const PIX_MAX = {
  merchantName: 25,
  merchantCity: 15,
  infoAdicional: 40,
  txid: 25,
} as const

export type PixKeyType = 'cpf' | 'cnpj' | 'phone' | 'email' | 'evp'

/**
 * Forces ASCII so that:
 *  - pix-utils' charCodeAt-based CRC16 (UTF-16 code units) matches the bank's
 *    UTF-8 byte-based CRC16
 *  - each field's declared TLV length equals its actual byte length
 * Also strips `&`, which stricter PSPs reject.
 */
export function toAsciiField(value: string, maxBytes: number): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .slice(0, maxBytes)
}

/**
 * Postgres `numeric` arrives from supabase-js as a string ("150.00").
 * Coerces and clamps to exactly 2 decimals; returns undefined when the
 * amount should be omitted from the payload entirely.
 */
export function toPixAmount(
  raw: string | number | null | undefined
): number | undefined {
  if (raw === null || raw === undefined || raw === '') return undefined
  const n = typeof raw === 'string' ? Number.parseFloat(raw) : raw
  if (!Number.isFinite(n) || n <= 0) return undefined
  return Number(n.toFixed(2))
}

/**
 * Canonical, unpunctuated key form.
 * Pass `type` explicitly when known — bare 11 digits are ambiguous
 * (CPF and DDD+mobile are both 11 digits) and default to CPF.
 */
export function normalizePixKey(raw: string, type?: PixKeyType): string {
  const key = raw.trim()
  const digits = key.replace(/\D/g, '')

  switch (type ?? inferPixKeyType(key)) {
    case 'cpf':
      return digits.slice(-11)
    case 'cnpj':
      return digits.slice(-14)
    case 'phone':
      return `+55${digits.slice(-11)}`
    case 'email':
    case 'evp':
      return key.toLowerCase()
  }
}

function inferPixKeyType(key: string): PixKeyType {
  if (key.includes('@')) return 'email'
  if (/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(key)) return 'evp'
  if (key.startsWith('+') || /[()]/.test(key)) return 'phone'

  const digits = key.replace(/\D/g, '')
  if (digits.length === 14) return 'cnpj'
  if (digits.length === 12 || digits.length === 13) return 'phone' // includes +55
  if (digits.length === 10) return 'phone' // landline, no DDI
  if (digits.length === 11) return 'cpf' // ambiguous — override for mobile
  return 'email'
}
