import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import { describe, expect, it, vi } from 'vitest'
import { createGiftUseCase, updateGiftUseCase } from '../manage-gift.use-case'

const ID = '22222222-2222-4222-8222-222222222222'

const deps = (user: unknown = { id: 'u1' }) => ({
  giftsRepo: {
    list: vi.fn(),
    getById: vi.fn().mockResolvedValue(null),
    create: vi.fn(async (d: unknown) => d),
    update: vi.fn(async (d: unknown) => d),
    delete: vi.fn(),
    reserve: vi.fn(),
  },
  storageRepo: { upload: vi.fn(), remove: vi.fn() },
  authService: { getCurrentUser: vi.fn().mockResolvedValue(user) },
})

const base = { name: 'Presente' }

/**
 * Zod strips absent optional keys instead of setting them to undefined, and
 * expect.objectContaining requires a key to exist before comparing its value.
 * So "this field never reached the repo" must be asserted on the received
 * payload — not with objectContaining({ price: undefined }).
 */
const payloadOf = (fn: { mock: { calls: unknown[][] } }) =>
  fn.mock.calls[0]?.[0] as Record<string, unknown> | undefined

describe('createGiftUseCase — auth', () => {
  it('throws when there is no session', async () => {
    await expect(
      createGiftUseCase(deps(null) as never)({
        ...base,
        kind: 'fixed_item',
        price: '100',
      })
    ).rejects.toBeInstanceOf(UnauthenticatedError)
  })
})

describe('createGiftUseCase — fixed_item', () => {
  it('accepts a price', async () => {
    const d = deps()
    await createGiftUseCase(d as never)({
      ...base,
      kind: 'fixed_item',
      price: '890.50',
    })
    expect(d.giftsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'fixed_item', price: 890.5 })
    )
  })

  it('rejects a missing price', async () => {
    await expect(
      createGiftUseCase(deps() as never)({ ...base, kind: 'fixed_item' })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects a minimum amount', async () => {
    await expect(
      createGiftUseCase(deps() as never)({
        ...base,
        kind: 'fixed_item',
        price: '100',
        minAmount: '10',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('accepts a payment link', async () => {
    const d = deps()
    await createGiftUseCase(d as never)({
      ...base,
      kind: 'fixed_item',
      price: '100',
      paymentLink: 'https://pay.example/abc',
    })
    expect(d.giftsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ paymentLink: 'https://pay.example/abc' })
    )
  })
})

describe('createGiftUseCase — open_item', () => {
  it('accepts min + suggestions and no price', async () => {
    const d = deps()
    await createGiftUseCase(d as never)({
      ...base,
      kind: 'open_item',
      minAmount: '50',
      suggestedAmounts: [100, 200, 350],
    })
    expect(d.giftsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'open_item', minAmount: 50 })
    )
  })

  it('accepts an open item with no minimum and no suggestions', async () => {
    const d = deps()
    await createGiftUseCase(d as never)({ ...base, kind: 'open_item' })

    expect(d.giftsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Presente',
        category: 'other',
        kind: 'open_item',
        suggestedAmounts: [],
      })
    )

    const payload = payloadOf(d.giftsRepo.create)
    expect(payload?.price).toBeUndefined()
    expect(payload?.minAmount).toBeUndefined()
  })

  it('rejects a fixed price', async () => {
    await expect(
      createGiftUseCase(deps() as never)({
        ...base,
        kind: 'open_item',
        price: '100',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects a goal amount', async () => {
    await expect(
      createGiftUseCase(deps() as never)({
        ...base,
        kind: 'open_item',
        goalAmount: '3000',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })
})

describe('createGiftUseCase — fund', () => {
  it('accepts a goal', async () => {
    const d = deps()
    await createGiftUseCase(d as never)({
      ...base,
      kind: 'fund',
      goalAmount: '3000',
      suggestedAmounts: [50, 150, 300],
    })
    expect(d.giftsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'fund', goalAmount: 3000 })
    )
  })

  // The "no value, no suggestions" case.
  it('accepts an open-ended fund with nothing filled in', async () => {
    const d = deps()
    await createGiftUseCase(d as never)({ ...base, kind: 'fund' })

    expect(d.giftsRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Presente',
        category: 'other',
        kind: 'fund',
        suggestedAmounts: [],
      })
    )

    const payload = payloadOf(d.giftsRepo.create)
    expect(payload?.price).toBeUndefined()
    expect(payload?.minAmount).toBeUndefined()
    expect(payload?.goalAmount).toBeUndefined()
  })

  it('rejects a minimum above the goal', async () => {
    await expect(
      createGiftUseCase(deps() as never)({
        ...base,
        kind: 'fund',
        minAmount: '5000',
        goalAmount: '3000',
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects a suggestion below the minimum', async () => {
    await expect(
      createGiftUseCase(deps() as never)({
        ...base,
        kind: 'fund',
        minAmount: '100',
        suggestedAmounts: [50, 200],
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects more than 4 suggestions', async () => {
    await expect(
      createGiftUseCase(deps() as never)({
        ...base,
        kind: 'fund',
        suggestedAmounts: [10, 20, 30, 40, 50],
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })
})

describe('updateGiftUseCase', () => {
  // Unrefined on purpose: an absent kind cannot be distinguished from an
  // unchanged one, so the CHECK constraint and trigger are the authority.
  it('accepts a partial update with no kind', async () => {
    const d = deps()
    await updateGiftUseCase(d as never)({ id: ID, name: 'Novo nome' })
    expect(d.giftsRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: ID, name: 'Novo nome' })
    )
  })

  it('passes kind through when present', async () => {
    const d = deps()
    await updateGiftUseCase(d as never)({ id: ID, kind: 'fund' })
    expect(d.giftsRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'fund' })
    )
  })

  it('rejects a missing id', async () => {
    await expect(
      updateGiftUseCase(deps() as never)({ name: 'Sem id' })
    ).rejects.toBeInstanceOf(ValidationError)
  })
})
