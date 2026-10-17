import type { Expense, ExpenseInstallment } from '@/src/entities/models/expense'
import { describe, expect, it, vi } from 'vitest'
import { notifyOverdueExpensesUseCase } from '../notify-overdue-expenses.use-case'

const TODAY = '2026-10-16'

const inst = (o: Partial<ExpenseInstallment>): ExpenseInstallment => ({
  id: crypto.randomUUID(),
  dueDate: '2026-10-01',
  amount: 100,
  paidAmount: 0,
  paidBy: null,
  ...o,
})

const expense = (o: Partial<Expense> = {}): Expense => ({
  id: '11111111-1111-4111-8111-111111111111',
  description: 'Buffet',
  totalAmount: 300,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  installments: [],
  ...o,
})

const setup = (expenses: Expense[]) => {
  const send = vi.fn().mockResolvedValue(undefined)
  const run = notifyOverdueExpensesUseCase({
    expensesRepo: { list: vi.fn().mockResolvedValue(expenses) } as never,
    notificationService: { send },
  })
  return { send, run }
}

describe('notifyOverdueExpensesUseCase', () => {
  it('sends nothing when no installment is overdue', async () => {
    const { send, run } = setup([
      expense({
        installments: [
          inst({ dueDate: TODAY }), // due today is not overdue yet
          inst({ dueDate: '2026-11-01' }),
          inst({ dueDate: '2026-09-01', paidAmount: 100 }), // paid
        ],
      }),
    ])
    expect(await run(TODAY)).toEqual({ overdueCount: 0 })
    expect(send).not.toHaveBeenCalled()
  })

  it('sends one digest for all overdue installments, most late first', async () => {
    const { send, run } = setup([
      expense({
        installments: [
          inst({ dueDate: '2026-09-16' }),
          inst({ dueDate: '2026-10-10' }),
          inst({ dueDate: '2026-12-01' }),
        ],
      }),
    ])
    expect(await run(TODAY)).toEqual({ overdueCount: 2 })
    expect(send).toHaveBeenCalledTimes(1)
    const msg: string = send.mock.calls[0]![0]
    expect(msg).toContain('2 parcelas vencidas')
    expect(msg).toContain('(1/3)')
    expect(msg).toContain('30 dias de atraso')
    expect(msg).toContain('6 dias de atraso')
    expect(msg.indexOf('30 dias')).toBeLessThan(msg.indexOf('6 dias'))
    expect(msg).toContain('/admin/despesas')
  })

  it('counts only the unpaid remainder of a partially paid installment', async () => {
    const { send, run } = setup([
      expense({ installments: [inst({ amount: 100, paidAmount: 40 })] }),
    ])
    await run(TODAY)
    expect(send.mock.calls[0]![0]).toMatch(/R\$\s60,00/)
  })

  it('escapes HTML in the expense description', async () => {
    const { send, run } = setup([
      expense({
        description: '<b>Fotógrafo</b> & Cia',
        installments: [inst({})],
      }),
    ])
    await run(TODAY)
    expect(send.mock.calls[0]![0]).toContain(
      '&lt;b&gt;Fotógrafo&lt;/b&gt; &amp; Cia'
    )
  })

  it('caps the message length and says how many were left out', async () => {
    const many = Array.from({ length: 30 }, () => inst({}))
    const { send, run } = setup([expense({ installments: many })])
    await run(TODAY)
    expect(send.mock.calls[0]![0]).toContain('… e mais 10')
  })

  it('lets a send failure surface so the scheduled run fails', async () => {
    const { send, run } = setup([expense({ installments: [inst({})] })])
    send.mockRejectedValue(new Error('telegram down'))
    await expect(run(TODAY)).rejects.toThrow('telegram down')
  })
})
