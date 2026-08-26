export const PIX_MAX = {
  merchantName: 25,
  merchantCity: 15,
  infoAdicional: 40,
  txid: 25,
} as const

/** EMV: every field length is exactly 2 digits, so no value may exceed 99 bytes. */
export const EMV_FIELD_MAX = 99

const PIX_GUI = 'br.gov.bcb.pix'
const byteLen = (s: string) => new TextEncoder().encode(s).length

export type PixKeyType = 'cpf' | 'cnpj' | 'phone' | 'email' | 'evp'

/**
 * Forces ASCII so that:
 *  - pix-utils' charCodeAt-based CRC16 matches the bank's UTF-8 CRC16
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

/** Bytes tag 26 (merchant account template) will occupy. */
export function merchantTemplateSize(pixKey: string, info?: string): number {
  const gui = 4 + byteLen(PIX_GUI) // 0014br.gov.bcb.pix
  const key = 4 + byteLen(pixKey) // 01LL<key>
  const add = info ? 4 + byteLen(info) : 0 // 02LL<info>
  return gui + key + add
}

/**
 * Max infoAdicional bytes that keep tag 26 within 99.
 * pix-utils nests infoAdicional inside tag 26; overflowing makes it emit a
 * 3-digit length, which every bank rejects.
 */
export function infoAdicionalBudget(pixKey: string): number {
  return Math.max(0, EMV_FIELD_MAX - merchantTemplateSize(pixKey) - 4)
}

/** Returns null when inputs are safe, otherwise the reason. */
export function validatePixInputs(args: {
  pixKey: string
  merchantName: string
  merchantCity: string
  infoAdicional?: string
}): string | null {
  const { pixKey, merchantName, merchantCity, infoAdicional } = args

  if (!pixKey) return 'pixKey is empty'

  const size = merchantTemplateSize(pixKey, infoAdicional)
  if (size > EMV_FIELD_MAX) {
    return `Merchant template (tag 26) would be ${size} bytes, max ${EMV_FIELD_MAX}. Shorten or drop infoAdicional (budget: ${infoAdicionalBudget(pixKey)} bytes).`
  }
  if (byteLen(merchantName) > PIX_MAX.merchantName) {
    return `merchantName is ${byteLen(merchantName)} bytes, max ${PIX_MAX.merchantName}`
  }
  if (byteLen(merchantCity) > PIX_MAX.merchantCity) {
    return `merchantCity is ${byteLen(merchantCity)} bytes, max ${PIX_MAX.merchantCity}`
  }
  return null
}

/** Postgres `numeric` arrives from supabase-js as a string ("150.00"). */
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
  if (digits.length === 12 || digits.length === 13) return 'phone'
  if (digits.length === 10) return 'phone'
  if (digits.length === 11) return 'cpf'
  return 'email'
}

/**
 * Same coercion as toPixAmount, but throws instead of returning undefined.
 * pix-utils declares transactionAmount as a required `number`, and every
 * gift on this site has a chosen value, so absence is a bug not a state.
 */
export function requirePixAmount(
  raw: string | number | null | undefined
): number {
  const amount = toPixAmount(raw)
  if (amount === undefined) {
    throw new RangeError(
      `Invalid PIX amount: ${JSON.stringify(raw)} (${typeof raw})`
    )
  }
  return amount
}
