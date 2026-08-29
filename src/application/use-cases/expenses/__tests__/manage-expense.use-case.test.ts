import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import { describe, expect, it, vi } from 'vitest'
import {
  createExpenseUseCase,
  deleteExpenseUseCase,
  updateExpenseUseCase,
} from '../manage-expense.use-case'

const ID = '11111111-1111-4111-8111-111111111111'

const deps = (user: unknown = { id: 'u1' }) => ({
  expensesRepo: {
    list: vi.fn(),
    getById: vi.fn().mockResolvedValue(null),
    create: vi.fn(async (d: unknown) => d),
    update: vi.fn(async (d: unknown) => d),
    delete: vi.fn(),
  },
  authService: { getCurrentUser: vi.fn().mockResolvedValue(user) },
})

const oneInstallment = (overrides: Partial<Record<string, unknown>> = {}) => [
  { dueDate: '2026-09-01', amount: '100.00', paidAmount: '0', ...overrides },
]

const payloadOf = (fn: { mock: { calls: unknown[][] } }) =>
  fn.mock.calls[0]?.[0] as Record<string, unknown> | undefined

describe('createExpenseUseCase — auth', () => {
  it('throws when there is no session', async () => {
    await expect(
      createExpenseUseCase(deps(null) as never)({
        description: 'Buffet',
        totalAmount: '100.00',
        installments: oneInstallment(),
      })
    ).rejects.toBeInstanceOf(UnauthenticatedError)
  })
})

describe('createExpenseUseCase — validation', () => {
  it('rejects a missing description', async () => {
    await expect(
      createExpenseUseCase(deps() as never)({
        totalAmount: '100.00',
        installments: oneInstallment(),
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects zero installments', async () => {
    await expect(
      createExpenseUseCase(deps() as never)({
        description: 'Buffet',
        totalAmount: '100.00',
        installments: [],
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects when installment amounts do not sum to the total', async () => {
    await expect(
      createExpenseUseCase(deps() as never)({
        description: 'Buffet',
        totalAmount: '200.00',
        installments: oneInstallment(),
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('rejects a paidAmount greater than the installment amount', async () => {
    await expect(
      createExpenseUseCase(deps() as never)({
        description: 'Buffet',
        totalAmount: '100.00',
        installments: oneInstallment({ paidAmount: '150.00' }),
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('accepts installments summing to the total', async () => {
    const d = deps()
    await createExpenseUseCase(d as never)({
      description: 'Buffet',
      totalAmount: '300.00',
      installments: [
        { dueDate: '2026-09-01', amount: '100.00', paidAmount: '100.00' },
        { dueDate: '2026-10-01', amount: '200.00', paidAmount: '0' },
      ],
    })

    expect(d.expensesRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'Buffet', totalAmount: 300 })
    )
    const payload = payloadOf(d.expensesRepo.create)
    expect(payload?.installments).toHaveLength(2)
  })
})

describe('updateExpenseUseCase', () => {
  it('throws when there is no session', async () => {
    await expect(
      updateExpenseUseCase(deps(null) as never)({
        id: ID,
        description: 'Buffet',
        totalAmount: '100.00',
        installments: oneInstallment(),
      })
    ).rejects.toBeInstanceOf(UnauthenticatedError)
  })

  it('requires a valid id', async () => {
    await expect(
      updateExpenseUseCase(deps() as never)({
        id: 'not-a-uuid',
        description: 'Buffet',
        totalAmount: '100.00',
        installments: oneInstallment(),
      })
    ).rejects.toBeInstanceOf(ValidationError)
  })

  it('calls the repo with the parsed payload', async () => {
    const d = deps()
    await updateExpenseUseCase(d as never)({
      id: ID,
      description: 'Buffet atualizado',
      totalAmount: '100.00',
      installments: oneInstallment(),
    })

    expect(d.expensesRepo.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: ID, description: 'Buffet atualizado' })
    )
  })
})

describe('deleteExpenseUseCase', () => {
  it('throws when there is no session', async () => {
    await expect(
      deleteExpenseUseCase(deps(null) as never)(ID)
    ).rejects.toBeInstanceOf(UnauthenticatedError)
  })

  it('deletes via the repo', async () => {
    const d = deps()
    await deleteExpenseUseCase(d as never)(ID)
    expect(d.expensesRepo.delete).toHaveBeenCalledWith(ID)
  })
})
