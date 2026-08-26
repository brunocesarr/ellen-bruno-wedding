import { describe, expect, it } from 'vitest'
import { crc16, validateBRCode, validateTlv } from '../br-code'
import { normalizePixKey, toAsciiField, toPixAmount } from '../pix-sanitize'

describe('toAsciiField', () => {
  it('strips accents and ampersands', () => {
    expect(toAsciiField('Ellen & Bruno César', 25)).toBe('ELLEN BRUNO CESAR')
    expect(toAsciiField('São Paulo', 15)).toBe('SAO PAULO')
  })

  it('keeps byte length equal to char length', () => {
    const out = toAsciiField('João Ção ãéíôç', 25)
    expect(new TextEncoder().encode(out).length).toBe(out.length)
  })

  it('truncates to the byte limit', () => {
    expect(toAsciiField('A'.repeat(40), 15)).toHaveLength(15)
  })

  it('collapses whitespace left by removed characters', () => {
    expect(toAsciiField('Ellen  &  Bruno', 25)).toBe('ELLEN BRUNO')
  })
})

describe('toPixAmount', () => {
  it('parses numeric-as-string from supabase', () => {
    expect(toPixAmount('150.00')).toBe(150)
  })

  it('clamps float artifacts to 2 decimals', () => {
    expect(toPixAmount(450 / 7)).toBe(64.29)
    expect(toPixAmount(19.99 * 3)).toBe(59.97)
  })

  it('returns undefined for empty, zero, negative and NaN', () => {
    expect(toPixAmount('')).toBeUndefined()
    expect(toPixAmount(0)).toBeUndefined()
    expect(toPixAmount(-10)).toBeUndefined()
    expect(toPixAmount('abc')).toBeUndefined()
    expect(toPixAmount(null)).toBeUndefined()
    expect(toPixAmount(undefined)).toBeUndefined()
  })
})

describe('normalizePixKey', () => {
  it.each([
    ['123.456.789-01', '12345678901'],
    ['12.345.678/0001-99', '12345678000199'],
    ['(31) 99999-8888', '+5531999998888'],
    ['+55 31 99999-8888', '+5531999998888'],
    ['5531999998888', '+5531999998888'],
    ['Ellen@Example.COM', 'ellen@example.com'],
    [
      'A1B2C3D4-E5F6-4A7B-8C9D-0E1F2A3B4C5D',
      'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    ],
  ])('normalizes %s', (input, expected) => {
    expect(normalizePixKey(input)).toBe(expected)
  })

  it('treats bare 11 digits as CPF unless told otherwise', () => {
    expect(normalizePixKey('31999998888')).toBe('31999998888')
    expect(normalizePixKey('31999998888', 'phone')).toBe('+5531999998888')
  })

  it('respects an explicit type override', () => {
    expect(normalizePixKey('(31) 99999-8888', 'cpf')).toBe('31999998888')
  })
})

describe('crc16', () => {
  it('matches the pix-utils reference vector', () => {
    const ref =
      '00020126650014br.gov.bcb.pix0119nubank@thalesog.com0220Gerado por Pix-Utils' +
      '52040000530398654041.005802BR5914Thales Ogliari6009Sao Paulo62070503***6304'
    expect(crc16(ref)).toBe('6069')
  })

  it('differs for accented input, proving the encoding matters', () => {
    expect(crc16('Joao')).not.toBe(crc16('João'))
  })
})

describe('validateTlv', () => {
  it('flags an accent that breaks the declared byte count', () => {
    expect(validateTlv('5905Joãoé')).toMatch(/declares 5 bytes but value is 7/)
  })

  it('passes clean ASCII', () => {
    expect(validateTlv('5905JOAOX')).toBeNull()
  })

  it('reports the nested path for template subfields', () => {
    expect(validateTlv('62110503***0402ãé')).toMatch(/Field 62\.04/)
  })
})

describe('validateBRCode', () => {
  const withCrc = (body: string) => body + crc16(body)

  it('rejects a payload with the wrong prefix', () => {
    expect(validateBRCode('999901' + '6304ABCD')).toMatch(/must start with/)
  })

  it('rejects a mutated payload', () => {
    expect(validateBRCode('00020126580014br.gov.bcb.pix6304ABCD')).toMatch(
      /CRC mismatch/
    )
  })

  it('reaches the TLV walk once the CRC is correct', () => {
    const broken = withCrc('0002015905Joãoé6009SAO PAULO6304')
    expect(validateBRCode(broken)).toMatch(/Field 59 declares/)
  })

  it('accepts a well-formed ASCII payload', () => {
    const body =
      '00020126360014br.gov.bcb.pix0114+5531999998888' +
      '52040000530398654041.005802BR5917ELLEN BRUNO CESAR' +
      '6009SAO PAULO62070503***6304'
    expect(validateBRCode(withCrc(body))).toBeNull()
  })
})
