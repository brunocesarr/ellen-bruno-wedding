import type { IExpensesRepository } from '@/src/application/repositories/expenses.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import type { Expense, ExpenseInstallment } from '@/src/entities/models/expense'

export type InstallmentStatus = 'paid' | 'partial' | 'pending'

export type InstallmentWithStatus = ExpenseInstallment & {
  status: InstallmentStatus
  isOverdue: boolean
}

export type ExpenseWithStatus = Omit<Expense, 'installments'> & {
  installments: InstallmentWithStatus[]
  paidTotal: number
  outstanding: number
}

type Deps = {
  expensesRepo: IExpensesRepository
  authService: IAuthService
}

function statusOf(i: ExpenseInstallment): InstallmentStatus {
  if (i.paidAmount >= i.amount - 1e-6) return 'paid'
  if (i.paidAmount > 1e-6) return 'partial'
  return 'pending'
}

export function listExpensesUseCase(d: Deps) {
  return async (): Promise<ExpenseWithStatus[]> => {
    if (!(await d.authService.getCurrentUser())) {
      throw new UnauthenticatedError()
    }

    const expenses = await d.expensesRepo.list()
    const today = new Date().toISOString().slice(0, 10)

    return expenses.map((e) => {
      const installments = e.installments.map((i) => {
        const status = statusOf(i)
        return {
          ...i,
          status,
          isOverdue: status !== 'paid' && i.dueDate < today,
        }
      })

      return {
        ...e,
        installments,
        paidTotal: installments.reduce((s, i) => s + i.paidAmount, 0),
        outstanding: installments.reduce(
          (s, i) => s + (i.amount - i.paidAmount),
          0
        ),
      }
    })
  }
}
