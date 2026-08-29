import { UnauthenticatedError } from '@/src/entities/errors/auth'
import type { Expense } from '@/src/entities/models/expense'
import { describe, expect, it, vi } from 'vitest'
import { listExpensesUseCase } from '../list-expenses.use-case'

const expense = (overrides: Partial<Expense> = {}): Expense => ({
  id: '11111111-1111-4111-8111-111111111111',
  description: 'Buffet',
  totalAmount: 300,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  installments: [],
  ...overrides,
})

const deps = (list: Expense[], user: unknown = { id: 'u1' }) => ({
  expensesRepo: { list: vi.fn().mockResolvedValue(list) },
  authService: { getCurrentUser: vi.fn().mockResolvedValue(user) },
})

describe('listExpensesUseCase — auth', () => {
  it('throws when there is no session', async () => {
    await expect(
      listExpensesUseCase(deps([], null) as never)()
    ).rejects.toBeInstanceOf(UnauthenticatedError)
  })
})

describe('listExpensesUseCase — status derivation', () => {
  it('marks a fully paid installment as paid', async () => {
    const d = deps([
      expense({
        installments: [
          {
            id: 'i1',
            dueDate: '2020-01-01',
            amount: 100,
            paidAmount: 100,
            paidBy: 'Bruno',
          },
        ],
      }),
    ])

    const [result] = await listExpensesUseCase(d as never)()
    const [installment] = result?.installments ?? []
    expect(installment?.status).toBe('paid')
    expect(installment?.isOverdue).toBe(false)
    expect(result?.paidTotal).toBe(100)
    expect(result?.outstanding).toBe(0)
  })

  it('marks a partially paid, past-due installment as partial and overdue', async () => {
    const d = deps([
      expense({
        installments: [
          {
            id: 'i1',
            dueDate: '2020-01-01',
            amount: 100,
            paidAmount: 40,
            paidBy: null,
          },
        ],
      }),
    ])

    const [result] = await listExpensesUseCase(d as never)()
    const [installment] = result?.installments ?? []
    expect(installment?.status).toBe('partial')
    expect(installment?.isOverdue).toBe(true)
    expect(result?.outstanding).toBe(60)
  })

  it('marks an unpaid, future installment as pending and not overdue', async () => {
    const d = deps([
      expense({
        installments: [
          {
            id: 'i1',
            dueDate: '2999-01-01',
            amount: 100,
            paidAmount: 0,
            paidBy: null,
          },
        ],
      }),
    ])

    const [result] = await listExpensesUseCase(d as never)()
    const [installment] = result?.installments ?? []
    expect(installment?.status).toBe('pending')
    expect(installment?.isOverdue).toBe(false)
  })
})
