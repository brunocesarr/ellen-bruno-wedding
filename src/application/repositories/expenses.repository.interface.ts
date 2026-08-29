import type {
  CreateExpenseInput,
  Expense,
  UpdateExpenseInput,
} from '@/src/entities/models/expense'

export interface IExpensesRepository {
  list(): Promise<Expense[]>
  getById(id: string): Promise<Expense | null>
  create(data: CreateExpenseInput): Promise<Expense>
  update(data: UpdateExpenseInput): Promise<Expense>
  delete(id: string): Promise<void>
}
