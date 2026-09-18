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

const deps = (
  list: Expense[],
  user: unknown = { id: 'u1' },
  documents: unknown[] = []
) => ({
  expensesRepo: { list: vi.fn().mockResolvedValue(list) },
  expenseDocumentsRepo: { list: vi.fn().mockResolvedValue(documents) },
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

describe('listExpensesUseCase — documents', () => {
  const EXPENSE_ID = '11111111-1111-4111-8111-111111111111'

  const doc = (overrides: Record<string, unknown>) => ({
    id: 'd1',
    expenseId: EXPENSE_ID,
    installmentId: null,
    kind: 'payment_proof',
    filePath: 'expenses/x/f.webp',
    fileName: 'f.webp',
    mimeType: 'image/webp',
    sizeBytes: 1000,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  })

  const withInstallment = expense({
    installments: [
      {
        id: 'i1',
        dueDate: '2026-01-01',
        amount: 100,
        paidAmount: 100,
        paidBy: null,
      },
    ],
  })

  it('splits documents into contract, per-parcela and loose buckets', async () => {
    const d = deps([withInstallment], { id: 'u1' }, [
      doc({ id: 'c1', kind: 'contract' }),
      doc({ id: 'p1', installmentId: 'i1' }),
      doc({ id: 'p2' }),
    ])

    const [result] = await listExpensesUseCase(d as never)()
    expect(result?.contracts.map((c) => c.id)).toEqual(['c1'])
    expect(result?.installments[0]?.documents.map((p) => p.id)).toEqual(['p1'])
    expect(result?.looseProofs.map((p) => p.id)).toEqual(['p2'])
    expect(result?.documentsSizeBytes).toBe(3000)
  })

  it('ignores documents belonging to another expense', async () => {
    const d = deps([withInstallment], { id: 'u1' }, [
      doc({ id: 'other', expenseId: 'someone-else', kind: 'contract' }),
    ])

    const [result] = await listExpensesUseCase(d as never)()
    expect(result?.contracts).toHaveLength(0)
    expect(result?.documentsSizeBytes).toBe(0)
  })
})
