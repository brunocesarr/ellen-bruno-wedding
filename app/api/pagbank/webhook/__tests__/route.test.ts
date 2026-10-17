import { createHash } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const confirm = vi.fn()

vi.mock(
  '@/src/application/use-cases/gifts/confirm-card-payment.use-case',
  () => ({
    confirmCardPaymentUseCase: () => confirm,
  })
)
vi.mock('@/src/infrastructure/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({}),
}))
vi.mock('@/src/infrastructure/repositories/supabase-gifts.repository', () => ({
  SupabaseGiftsRepository: class {},
}))
vi.mock(
  '@/src/infrastructure/repositories/supabase-pix-confirmations.repository',
  () => ({ SupabasePixConfirmationsRepository: class {} })
)
vi.mock('@/src/infrastructure/services/telegram-notification.service', () => ({
  createNotificationService: () => ({ send: vi.fn() }),
}))

import { POST } from '../route'

const TOKEN = 'test-token'
const sign = (raw: string) =>
  createHash('sha256').update(`${TOKEN}-${raw}`).digest('hex')

function req(raw: string, headers: Record<string, string>) {
  return new Request('http://localhost/api/pagbank/webhook', {
    method: 'POST',
    body: raw,
    headers,
  })
}

describe('POST /api/pagbank/webhook', () => {
  beforeEach(() => {
    confirm.mockReset().mockResolvedValue(undefined)
    vi.stubEnv('PAGBANK_TOKEN', TOKEN)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  it('rejects a bad signature with 401 and never touches the ledger', async () => {
    const res = await POST(
      req('{"a":1}', {
        'x-authenticity-token': 'deadbeef',
        'x-product-origin': 'CHECKOUT',
        'x-product-id': 'CHEC_1',
      })
    )
    expect(res.status).toBe(401)
    expect(confirm).not.toHaveBeenCalled()
  })

  it('hashes the raw body exactly as received (whitespace included)', async () => {
    const raw = '{ "a" :  1 }'
    const res = await POST(
      req(raw, {
        'x-authenticity-token': sign(raw),
        'x-product-origin': 'CHECKOUT',
        'x-product-id': 'CHEC_1',
      })
    )
    expect(res.status).toBe(200)
    expect(confirm).toHaveBeenCalledWith('CHEC_1')
  })

  it('acks non-checkout notifications without processing them', async () => {
    const raw = '{}'
    const res = await POST(
      req(raw, {
        'x-authenticity-token': sign(raw),
        'x-product-origin': 'ORDER',
        'x-product-id': 'ORDE_1',
      })
    )
    expect(res.status).toBe(200)
    expect(confirm).not.toHaveBeenCalled()
  })

  it('returns 500 when processing fails so PagBank retries', async () => {
    confirm.mockRejectedValue(new Error('db down'))
    const raw = '{}'
    const res = await POST(
      req(raw, {
        'x-authenticity-token': sign(raw),
        'x-product-origin': 'CHECKOUT',
        'x-product-id': 'CHEC_1',
      })
    )
    expect(res.status).toBe(500)
  })
})
