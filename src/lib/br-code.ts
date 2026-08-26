const byteLen = (s: string) => new TextEncoder().encode(s).length

/**
 * CRC16-CCITT-FALSE (poly 0x1021, init 0xFFFF) over UTF-8 bytes —
 * the way a bank recomputes it. Iterating charCodeAt instead would
 * disagree on any non-ASCII character.
 */
export function crc16(payload: string): string {
  let crc = 0xffff
  // for...of over a Uint8Array yields number, avoiding the
  // number | undefined that noUncheckedIndexedAccess gives bytes[i]
  for (const byte of new TextEncoder().encode(payload)) {
    crc ^= byte << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/** Returns null when valid, otherwise a message naming the broken field. */
export function validateBRCode(code: string): string | null {
  if (!code.startsWith('000201')) return 'BR Code must start with 000201'
  if (byteLen(code) > 512) return `BR Code too long: ${byteLen(code)} bytes`

  const expected = crc16(code.slice(0, -4))
  const actual = code.slice(-4).toUpperCase()
  if (expected !== actual) {
    return `CRC mismatch: expected ${expected}, got ${actual}`
  }

  return validateTlv(code)
}

/** Exported so byte-length checks are testable without a valid CRC. */
export function validateTlv(s: string, path = ''): string | null {
  let i = 0
  while (i < s.length) {
    const id = s.slice(i, i + 2)
    const len = Number.parseInt(s.slice(i + 2, i + 4), 10)
    if (!/^\d{2}$/.test(id) || Number.isNaN(len)) {
      return `Malformed TLV header at ${path}${id || '??'}`
    }
    const val = s.slice(i + 4, i + 4 + len)
    if (byteLen(val) !== len) {
      return `Field ${path}${id} declares ${len} bytes but value is ${byteLen(val)} ("${val}")`
    }
    if (id === '26' || id === '62') {
      const nested = validateTlv(val, `${path}${id}.`)
      if (nested) return nested
    }
    i += 4 + len
  }
  return null
}
