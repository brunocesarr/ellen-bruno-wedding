import { ValidationError } from '@/src/entities/errors/common'
import { describe, expect, it, vi } from 'vitest'
import { reserveGiftUseCase } from '../reserve-gift.use-case'

const ID = '11111111-1111-4111-8111-111111111111'

const repo = () => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  reserve: vi.fn().mockResolvedValue({
    gift: { id: ID, name: 'Vaquinha' },
    contributionId: 'c1',
  }),
})

describe('reserveGiftUseCase', () => {
  it('rejects a malformed gift id', async () => {
    await expect(
      reserveGiftUseCase({ giftsRepo: repo() as never })({
        giftId: 'nope',
        name: 'Ana',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects a name shorter than 2 characters', async () => {
    await expect(
      reserveGiftUseCase({ giftsRepo: repo() as never })({
        giftId: ID,
        name: 'A',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects more than 2 decimal places', async () => {
    await expect(
      reserveGiftUseCase({ giftsRepo: repo() as never })({
        giftId: ID,
        name: 'Ana',
        amount: '10.999',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  // 10.99 * 100 === 1099.0000000000002, so a naive Number.isInteger check
  // would reject this valid amount.
  it('accepts a float that IEEE-754 rounding would trip up', async () => {
    const giftsRepo = repo()

    await reserveGiftUseCase({ giftsRepo: giftsRepo as never })({
      giftId: ID,
      name: 'Ana',
      amount: '10.99',
    })

    expect(giftsRepo.reserve).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 10.99 })
    )
  })

  it('coerces a numeric string amount', async () => {
    const giftsRepo = repo()

    await reserveGiftUseCase({ giftsRepo: giftsRepo as never })({
      giftId: ID,
      name: 'Ana',
      amount: '150',
    })

    expect(giftsRepo.reserve).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 150 })
    )
  })

  // Amount rules live in the RPC; omitting it must not throw locally.
  it('passes amount through as undefined when omitted', async () => {
    const giftsRepo = repo()

    await reserveGiftUseCase({ giftsRepo: giftsRepo as never })({
      giftId: ID,
      name: 'Ana',
    })

    expect(giftsRepo.reserve).toHaveBeenCalledWith(
      expect.objectContaining({ amount: undefined })
    )
  })

  it('generates a contribution id for the PIX txid', async () => {
    const giftsRepo = repo()

    await reserveGiftUseCase({ giftsRepo: giftsRepo as never })({
      giftId: ID,
      name: 'Ana',
      amount: '100',
    })

    expect(giftsRepo.reserve.mock.calls[0]?.[0].contributionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    )
  })

  it('returns both the gift and the contribution id', async () => {
    const result = await reserveGiftUseCase({ giftsRepo: repo() as never })({
      giftId: ID,
      name: 'Ana',
      amount: '100',
    })

    expect(result).toEqual({
      gift: { id: ID, name: 'Vaquinha' },
      contributionId: 'c1',
    })
  })
})
