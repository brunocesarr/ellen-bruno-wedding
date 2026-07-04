import { describe, expect, it, vi } from 'vitest'

class RedirectError extends Error {
  constructor(public readonly url: string) {
    super(`REDIRECT:${url}`)
  }
}
const redirect = vi.fn((url: string) => {
  throw new RedirectError(url)
})
vi.mock('next/navigation', () => ({ redirect: (url: string) => redirect(url) }))

import { unwrapForPage } from '../server-action-result'

describe('unwrapForPage', () => {
  it('returns data when ok', () => {
    expect(unwrapForPage({ ok: true, data: 42 })).toBe(42)
  })

  it('redirects to login on unauthorized', () => {
    expect(() => unwrapForPage({ ok: false, error: 'unauthorized' })).toThrow(
      'REDIRECT:/admin/login'
    )
  })

  it('throws the error message otherwise', () => {
    expect(() => unwrapForPage({ ok: false, error: 'Boom' })).toThrow('Boom')
  })
})
