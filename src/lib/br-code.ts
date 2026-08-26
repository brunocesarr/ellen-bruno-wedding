const encoder = new TextEncoder()
const decoder = new TextDecoder()

const toBytes = (input: string | Uint8Array) =>
  typeof input === 'string' ? encoder.encode(input) : input

/**
 * CRC16-CCITT-FALSE (poly 0x1021, init 0xFFFF) over UTF-8 bytes —
 * the way a bank recomputes it. Iterating charCodeAt instead would
 * disagree on any non-ASCII character.
 */
export function crc16(payload: string): string {
  let crc = 0xffff
  for (const byte of encoder.encode(payload)) {
    crc ^= byte << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

/** Returns null when valid, otherwise a message naming the broken field. */
export function validateBRCode(code: string): string | null {
  const bytes = encoder.encode(code)

  if (!code.startsWith('000201')) return 'BR Code must start with 000201'
  if (bytes.length > 512) return `BR Code too long: ${bytes.length} bytes`

  const expected = crc16(code.slice(0, -4))
  const actual = code.slice(-4).toUpperCase()
  if (expected !== actual) {
    return `CRC mismatch: expected ${expected}, got ${actual}`
  }

  return validateTlv(bytes)
}

/**
 * Walks the payload in BYTES, because TLV lengths are byte counts.
 * Slicing by characters drifts on any multibyte input and reports a
 * bogus offset several fields later.
 */
export function validateTlv(
  input: string | Uint8Array,
  path = ''
): string | null {
  const bytes = toBytes(input)
  let i = 0

  while (i < bytes.length) {
    if (i + 4 > bytes.length) {
      return `Truncated TLV header at ${path}(byte offset ${i})`
    }

    const id = decoder.decode(bytes.subarray(i, i + 2))
    const rawLen = decoder.decode(bytes.subarray(i + 2, i + 4))

    if (!/^\d{2}$/.test(id) || !/^\d{2}$/.test(rawLen)) {
      return `Malformed TLV header at ${path}${id} (byte offset ${i}, length read as "${rawLen}")`
    }

    const len = Number.parseInt(rawLen, 10)
    const end = i + 4 + len

    if (end > bytes.length) {
      return `Field ${path}${id} declares ${len} bytes but only ${
        bytes.length - i - 4
      } remain`
    }

    const value = bytes.subarray(i + 4, end)
    const isTemplate = id === '26' || id === '62'

    if (!isTemplate && value.some((b) => b > 0x7f)) {
      return `Field ${path}${id} contains non-ASCII bytes ("${decoder.decode(
        value
      )}") — strip accents and emoji before generating`
    }

    if (isTemplate) {
      const nested = validateTlv(value, `${path}${id}.`)
      if (nested) return nested
    }

    i = end
  }

  return null
}

/**
 * Tolerant walk that prints every field with byte offsets and does NOT stop
 * at the first problem. Use this to see where a payload actually breaks.
 */
export function dumpBRCode(code: string): string {
  const bytes = encoder.encode(code)
  const lines = [
    `bytes=${bytes.length} chars=${code.length}`,
    `crc declared=${code.slice(-4).toUpperCase()} computed=${crc16(code.slice(0, -4))}`,
    `head=${JSON.stringify(code.slice(0, 30))}`,
    '--- fields ---',
  ]
  dumpLevel(bytes, '', lines)
  return lines.join('\n')
}

function dumpLevel(bytes: Uint8Array, path: string, lines: string[]): void {
  let i = 0
  while (i < bytes.length) {
    if (i + 4 > bytes.length) {
      lines.push(`${path}@${i} TRUNCATED header: ${hex(bytes.subarray(i))}`)
      return
    }

    const id = decoder.decode(bytes.subarray(i, i + 2))
    const rawLen = decoder.decode(bytes.subarray(i + 2, i + 4))

    if (!/^\d{2}$/.test(id) || !/^\d{2}$/.test(rawLen)) {
      lines.push(
        `${path}@${i} BAD header id=${JSON.stringify(id)} len=${JSON.stringify(rawLen)}`
      )
      lines.push(
        `${path}@${i} context=${hex(bytes.subarray(Math.max(0, i - 6), i + 10))}`
      )
      return
    }

    const len = Number.parseInt(rawLen, 10)
    const end = i + 4 + len
    const value = bytes.subarray(i + 4, Math.min(end, bytes.length))
    const text = decoder.decode(value)
    const flags = [
      end > bytes.length ? 'OVERRUN' : '',
      value.some((b) => b > 0x7f) ? 'NON-ASCII' : '',
    ]
      .filter(Boolean)
      .join(' ')

    lines.push(
      `${path}@${i} id=${id} len=${len} value=${JSON.stringify(text)} ${flags}`.trim()
    )

    if (id === '26' || id === '62') dumpLevel(value, `${path}${id}.`, lines)
    i = end
  }
}

const hex = (b: Uint8Array) =>
  Array.from(b)
    .map((n) => n.toString(16).padStart(2, '0'))
    .join(' ')
