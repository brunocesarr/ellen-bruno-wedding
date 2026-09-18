import type { IExpenseDocumentsRepository } from '@/src/application/repositories/expense-documents.repository.interface'
import type { IExpensesRepository } from '@/src/application/repositories/expenses.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import type { Expense, ExpenseInstallment } from '@/src/entities/models/expense'
import type { ExpenseDocument } from '@/src/entities/models/expense-document'

export type InstallmentStatus = 'paid' | 'partial' | 'pending'

export type InstallmentWithStatus = ExpenseInstallment & {
  status: InstallmentStatus
  isOverdue: boolean
  /** Comprovantes pinned to this parcela. */
  documents: ExpenseDocument[]
}

export type ExpenseWithStatus = Omit<Expense, 'installments'> & {
  installments: InstallmentWithStatus[]
  paidTotal: number
  outstanding: number
  /** Signed contracts for the expense as a whole. */
  contracts: ExpenseDocument[]
  /** Comprovantes not pinned to any one parcela. */
  looseProofs: ExpenseDocument[]
  documentsSizeBytes: number
}

type Deps = {
  expensesRepo: IExpensesRepository
  expenseDocumentsRepo: IExpenseDocumentsRepository
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

    // One flat documents read for the whole page rather than one per expense —
    // the admin list is small and this keeps it at two queries total.
    const [expenses, documents] = await Promise.all([
      d.expensesRepo.list(),
      d.expenseDocumentsRepo.list(),
    ])

    const byExpense = new Map<string, ExpenseDocument[]>()
    for (const doc of documents) {
      const bucket = byExpense.get(doc.expenseId)
      if (bucket) bucket.push(doc)
      else byExpense.set(doc.expenseId, [doc])
    }

    const today = new Date().toISOString().slice(0, 10)

    return expenses.map((e) => {
      const expenseDocuments = byExpense.get(e.id) ?? []

      const installments = e.installments.map((i) => {
        const status = statusOf(i)
        return {
          ...i,
          status,
          isOverdue: status !== 'paid' && i.dueDate < today,
          documents: expenseDocuments.filter(
            (doc) => doc.installmentId === i.id
          ),
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
        contracts: expenseDocuments.filter((doc) => doc.kind === 'contract'),
        looseProofs: expenseDocuments.filter(
          (doc) => doc.kind === 'payment_proof' && doc.installmentId === null
        ),
        documentsSizeBytes: expenseDocuments.reduce(
          (s, doc) => s + doc.sizeBytes,
          0
        ),
      }
    })
  }
}
