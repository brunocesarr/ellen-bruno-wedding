import type { Gift } from '@/src/entities/models/gift'
import { describe, expect, it, vi } from 'vitest'
import { listGiftsUseCase } from '../list-gifts.use-case'

const gift = (over: Partial<Gift>): Gift =>
  ({
    id: 'g1',
    name: 'Presente',
    description: null,
    price: 100,
    imagePath: null,
    isReserved: false,
    reservedByName: null,
    reservedMessage: null,
    reservedAt: null,
    category: 'other',
    kind: 'fixed_item',
    minAmount: null,
    suggestedAmounts: [],
    goalAmount: null,
    confirmedTotal: 0,
    pledgedTotal: 0,
    contributorCount: 0,
    viewCount: 0,
    ...over,
  }) as Gift

const deps = (gifts: Gift[]) => ({
  giftsRepo: {
    list: vi.fn().mockResolvedValue(gifts),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    reserve: vi.fn(),
  },
  pixRepo: { list: vi.fn() },
  authService: { getCurrentUser: vi.fn().mockResolvedValue({ id: 'u1' }) },
})

describe('listGiftsUseCase — exclusive items', () => {
  it('marks an unreserved item as pending', async () => {
    const [g] = await listGiftsUseCase(deps([gift({})]) as never)()
    expect(g?.status).toBe('pending')
  })

  it('marks a reserved item without money as reserved', async () => {
    const [g] = await listGiftsUseCase(
      deps([gift({ isReserved: true })]) as never
    )()
    expect(g?.status).toBe('reserved')
  })

  it('marks a reserved item with confirmed money as thanked', async () => {
    const [g] = await listGiftsUseCase(
      deps([gift({ isReserved: true, confirmedTotal: 100 })]) as never
    )()
    expect(g?.status).toBe('thanked')
  })

  it('ignores pledged-but-unconfirmed money', async () => {
    const [g] = await listGiftsUseCase(
      deps([
        gift({ isReserved: true, pledgedTotal: 100, confirmedTotal: 0 }),
      ]) as never
    )()
    expect(g?.status).toBe('reserved')
  })
})

describe('listGiftsUseCase — funds', () => {
  // Funds keep is_reserved = false forever, so status cannot be driven by it.
  it('marks an empty fund as pending', async () => {
    const [g] = await listGiftsUseCase(
      deps([gift({ kind: 'fund', price: null })]) as never
    )()
    expect(g?.status).toBe('pending')
    expect(g?.isReserved).toBe(false)
  })

  it('marks a fund with confirmed money as thanked while staying unreserved', async () => {
    const [g] = await listGiftsUseCase(
      deps([
        gift({
          kind: 'fund',
          price: null,
          confirmedTotal: 450,
          contributorCount: 3,
        }),
      ]) as never
    )()
    expect(g?.status).toBe('thanked')
    expect(g?.isReserved).toBe(false)
  })

  it('keeps a fund pending when contributions are unconfirmed', async () => {
    const [g] = await listGiftsUseCase(
      deps([
        gift({
          kind: 'fund',
          price: null,
          pledgedTotal: 200,
          confirmedTotal: 0,
        }),
      ]) as never
    )()
    expect(g?.status).toBe('pending')
  })

  it('no longer queries the pix repository', async () => {
    const d = deps([gift({ kind: 'fund', price: null })])
    await listGiftsUseCase(d as never)()
    expect(d.pixRepo.list).not.toHaveBeenCalled()
  })
})
