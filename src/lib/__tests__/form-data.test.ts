import { describe, expect, it } from 'vitest'
import {
  getBoolean,
  getFile,
  getNumber,
  getOptionalString,
  getString,
} from '../form-data'

function fd(entries: Record<string, string | File>): FormData {
  const form = new FormData()
  for (const [key, value] of Object.entries(entries)) form.append(key, value)
  return form
}

describe('form-data helpers', () => {
  it('getString returns the value or fallback', () => {
    expect(getString(fd({ name: 'Ana' }), 'name')).toBe('Ana')
    expect(getString(fd({}), 'name')).toBe('')
    expect(getString(fd({}), 'name', 'x')).toBe('x')
  })

  it('getOptionalString trims empty to undefined', () => {
    expect(getOptionalString(fd({ email: 'a@b.com' }), 'email')).toBe('a@b.com')
    expect(getOptionalString(fd({ email: '' }), 'email')).toBeUndefined()
    expect(getOptionalString(fd({}), 'email')).toBeUndefined()
  })

  it('getBoolean recognizes checkbox values', () => {
    expect(getBoolean(fd({ active: 'true' }), 'active')).toBe(true)
    expect(getBoolean(fd({ active: 'on' }), 'active')).toBe(true)
    expect(getBoolean(fd({ active: 'false' }), 'active')).toBe(false)
    expect(getBoolean(fd({}), 'active')).toBe(false)
  })

  it('getNumber parses or yields undefined', () => {
    expect(getNumber(fd({ order: '3' }), 'order')).toBe(3)
    expect(getNumber(fd({ order: 'nope' }), 'order')).toBeUndefined()
    expect(getNumber(fd({}), 'order')).toBeUndefined()
  })

  it('getFile returns files with content only', () => {
    const file = new File(['data'], 'a.png', { type: 'image/png' })
    expect(getFile(fd({ image: file }), 'image')).toBe(file)
    expect(
      getFile(fd({ image: new File([], 'empty.png') }), 'image')
    ).toBeNull()
    expect(getFile(fd({ image: 'not-a-file' }), 'image')).toBeNull()
  })
})
