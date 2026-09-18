import type {
  CreateExpenseDocumentData,
  ExpenseDocument,
} from '@/src/entities/models/expense-document'

export interface IExpenseDocumentsRepository {
  /** Every document, for every expense — the admin list is a handful of rows. */
  list(): Promise<ExpenseDocument[]>
  getById(id: string): Promise<ExpenseDocument | null>
  create(data: CreateExpenseDocumentData): Promise<ExpenseDocument>
  delete(id: string): Promise<void>
  /** Sum of `size_bytes`, used to enforce the free-tier storage budget. */
  totalSizeBytes(): Promise<number>
}
