import { createHmac } from 'node:crypto'
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

const SECRET = 'mp-secret'
const REQUEST_ID = 'req-123'
const PAYMENT_ID = '987654'

function signature(dataId: string, ts = String(Date.now())) {
  const manifest = `id:${dataId};request-id:${REQUEST_ID};ts:${ts};`
  const v1 = createHmac('sha256', SECRET).update(manifest).digest('hex')
  return `ts=${ts},v1=${v1}`
}

function req(opts: { body: unknown; sig?: string }) {
  return new Request(
    `http://localhost/api/mercado-pago/webhook?data.id=${PAYMENT_ID}`,
    {
      method: 'POST',
      body: JSON.stringify(opts.body),
      headers: {
        'x-request-id': REQUEST_ID,
        ...(opts.sig ? { 'x-signature': opts.sig } : {}),
      },
    }
  )
}

const paymentBody = { type: 'payment', data: { id: PAYMENT_ID } }

describe('POST /api/mercado-pago/webhook', () => {
  beforeEach(() => {
    confirm.mockReset().mockResolvedValue(undefined)
    vi.stubEnv('MERCADO_PAGO_ACCESS_TOKEN', 'token')
    vi.stubEnv('MERCADO_PAGO_WEBHOOK_SECRET', SECRET)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('acks non-payment pings without verifying or processing', async () => {
    const res = await POST(req({ body: { type: 'merchant_order' } }))
    expect(res.status).toBe(200)
    expect(confirm).not.toHaveBeenCalled()
  })

  it('rejects a missing/invalid signature with 401', async () => {
    const res = await POST(req({ body: paymentBody, sig: 'ts=1,v1=bad' }))
    expect(res.status).toBe(401)
    expect(confirm).not.toHaveBeenCalled()
  })

  it('processes a correctly signed payment notification', async () => {
    const res = await POST(
      req({ body: paymentBody, sig: signature(PAYMENT_ID) })
    )
    expect(res.status).toBe(200)
    expect(confirm).toHaveBeenCalledWith(PAYMENT_ID)
  })

  it('returns 500 on processing failure so Mercado Pago retries', async () => {
    confirm.mockRejectedValue(new Error('boom'))
    const res = await POST(
      req({ body: paymentBody, sig: signature(PAYMENT_ID) })
    )
    expect(res.status).toBe(500)
  })

  it('returns 500 when the service is not configured', async () => {
    vi.stubEnv('MERCADO_PAGO_ACCESS_TOKEN', '')
    const res = await POST(
      req({ body: paymentBody, sig: signature(PAYMENT_ID) })
    )
    expect(res.status).toBe(500)
  })
})
