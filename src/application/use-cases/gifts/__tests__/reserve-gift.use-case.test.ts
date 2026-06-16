import { ValidationError } from '@/src/entities/errors/common'
import { GiftAlreadyReservedError } from '@/src/entities/errors/gifts'
import { describe, expect, it, vi } from 'vitest'
import { reserveGiftUseCase } from '../reserve-gift.use-case'

const fakeGift = {
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  name: 'Liquidificador',
  description: null,
  price: 200,
  imagePath: null,
  isReserved: true,
  reservedByName: 'Ana',
  reservedByEmail: 'ana@x.com',
  reservedMessage: 'Felicidades!',
  reservedAt: new Date(),
  category: 'kitchen',
}

describe('reserveGiftUseCase', () => {
  it('reserves a gift when input is valid', async () => {
    const repo = { reserve: vi.fn().mockResolvedValue(fakeGift) } as any
    const result = await reserveGiftUseCase({ giftsRepo: repo })({
      giftId: fakeGift.id,
      name: 'Ana',
      message: 'Felicidades!',
    })
    expect(result).toEqual(fakeGift)
    expect(repo.reserve).toHaveBeenCalledWith(
      fakeGift.id,
      'Ana',
      'Felicidades!'
    )
  })

  it('throws ValidationError on bad input', async () => {
    const repo = { reserve: vi.fn() } as any
    await expect(
      reserveGiftUseCase({ giftsRepo: repo })({
        giftId: 'no',
        name: '',
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
        message: 'Felicidades!',
      })
    ).rejects.toBeInstanceOf(GiftAlreadyReservedError)
  })
})
