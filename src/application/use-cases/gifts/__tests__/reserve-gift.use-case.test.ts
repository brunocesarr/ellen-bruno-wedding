import { ValidationError } from '@/src/entities/errors/common'
import { GiftAlreadyReservedError } from '@/src/entities/errors/gifts'
import { describe, expect, it, vi } from 'vitest'
import { reserveGiftUseCase } from '../reserve-gift.use-case'

const fakeGift = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Liquidificador',
  description: null,
  price: 200,
  imagePath: null,
  isReserved: true,
  reservedByName: 'Ana',
  reservedByEmail: 'ana@x.com',
  reservedAt: new Date(),
}

describe('reserveGiftUseCase', () => {
  it('reserves a gift when input is valid', async () => {
    const repo = { reserve: vi.fn().mockResolvedValue(fakeGift) } as any
    const result = await reserveGiftUseCase({ giftsRepo: repo })({
      giftId: fakeGift.id,
      name: 'Ana',
      email: 'ana@x.com',
    })
    expect(result).toEqual(fakeGift)
    expect(repo.reserve).toHaveBeenCalledWith(fakeGift.id, 'Ana', 'ana@x.com')
  })

  it('throws ValidationError on bad input', async () => {
    const repo = { reserve: vi.fn() } as any
    await expect(
      reserveGiftUseCase({ giftsRepo: repo })({
        giftId: 'no',
        name: '',
        email: 'x',
      })
    ).rejects.toBeInstanceOf(ValidationError)
    expect(repo.reserve).not.toHaveBeenCalled()
  })

  it('propagates GiftAlreadyReservedError', async () => {
    const repo = {
      reserve: vi.fn().mockRejectedValue(new GiftAlreadyReservedError()),
    } as any
    await expect(
      reserveGiftUseCase({ giftsRepo: repo })({
        giftId: fakeGift.id,
        name: 'Ana',
        email: 'ana@x.com',
      })
    ).rejects.toBeInstanceOf(GiftAlreadyReservedError)
  })
})
