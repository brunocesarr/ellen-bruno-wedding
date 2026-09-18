import type {
  CreateExpenseInput,
  Expense,
  UpdateExpenseInput,
} from '@/src/entities/models/expense'

/**
 * Deleting an expense — or dropping one of its installments during an update —
 * cascades the matching `expense_documents` rows away in Postgres, but the
 * bytes in Supabase Storage have no such cascade. Both writes therefore report
 * the storage keys they orphaned so the use case can delete them and keep the
 * free-tier budget honest.
 */
export type ExpenseWriteResult = {
  expense: Expense
  orphanedDocumentPaths: string[]
}

export interface IExpensesRepository {
  list(): Promise<Expense[]>
  getById(id: string): Promise<Expense | null>
  create(data: CreateExpenseInput): Promise<Expense>
  update(data: UpdateExpenseInput): Promise<ExpenseWriteResult>
  delete(id: string): Promise<{ orphanedDocumentPaths: string[] }>
}
