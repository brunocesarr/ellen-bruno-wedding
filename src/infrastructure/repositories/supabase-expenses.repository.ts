import type { IExpensesRepository } from '@/src/application/repositories/expenses.repository.interface'
import { ExpenseNotFoundError } from '@/src/entities/errors/expenses'
import type {
  CreateExpenseInput,
  Expense,
  UpdateExpenseInput,
} from '@/src/entities/models/expense'
import type {
  ExpenseInsert,
  ExpenseInstallmentInsert,
  ExpenseInstallmentRow,
  ExpenseRow,
} from '@/src/infrastructure/supabase/db-types'
import type { TypedSupabaseClient } from '@/src/infrastructure/supabase/types'

const num = (v: number | string | null | undefined): number => {
  const n = typeof v === 'string' ? Number(v) : v
  return n == null || Number.isNaN(n) ? 0 : n
}

type ExpenseWithInstallments = ExpenseRow & {
  expense_installments: ExpenseInstallmentRow[] | null
}

const mapRow = (r: ExpenseWithInstallments): Expense => ({
  id: r.id,
  description: r.description,
  totalAmount: num(r.total_amount),
  createdAt: new Date(r.created_at),
  updatedAt: new Date(r.updated_at),
  installments: (r.expense_installments ?? [])
    .map((i) => ({
      id: i.id,
      dueDate: i.due_date,
      amount: num(i.amount),
      paidAmount: num(i.paid_amount),
      paidBy: i.paid_by,
    }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
})

const SELECT_WITH_INSTALLMENTS = '*, expense_installments(*)'

export class SupabaseExpensesRepository implements IExpensesRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async list(): Promise<Expense[]> {
    const { data, error } = await this.client
      .from('expenses')
      .select(SELECT_WITH_INSTALLMENTS)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((r) => mapRow(r as ExpenseWithInstallments))
  }

  async getById(id: string): Promise<Expense | null> {
    const { data, error } = await this.client
      .from('expenses')
      .select(SELECT_WITH_INSTALLMENTS)
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? mapRow(data as ExpenseWithInstallments) : null
  }

  private async replaceInstallments(
    expenseId: string,
    installments: CreateExpenseInput['installments']
  ): Promise<void> {
    const { error: deleteError } = await this.client
      .from('expense_installments')
      .delete()
      .eq('expense_id', expenseId)
    if (deleteError) throw deleteError

    const payload = installments.map(
      (i) =>
        ({
          expense_id: expenseId,
          due_date: i.dueDate,
          amount: i.amount,
          paid_amount: i.paidAmount,
          paid_by: i.paidBy ?? null,
        }) satisfies ExpenseInstallmentInsert
    )

    const { error: insertError } = await this.client
      .from('expense_installments')
      .insert(payload)
    if (insertError) throw insertError
  }

  // Writes go table-by-table, reads come back via getById — same
  // create/update-then-reread convention as gifts.
  async create(data: CreateExpenseInput): Promise<Expense> {
    const payload = {
      description: data.description,
      total_amount: data.totalAmount,
    } satisfies ExpenseInsert

    const { data: row, error } = await this.client
      .from('expenses')
      .insert(payload)
      .select('id')
      .single()
    if (error) throw error

    await this.replaceInstallments(row.id, data.installments)

    const created = await this.getById(row.id)
    if (!created) throw new ExpenseNotFoundError()
    return created
  }

  async update(data: UpdateExpenseInput): Promise<Expense> {
    const { id, installments, ...rest } = data

    const { error } = await this.client
      .from('expenses')
      .update({
        description: rest.description,
        total_amount: rest.totalAmount,
      } satisfies ExpenseInsert)
      .eq('id', id)
    if (error) throw error

    await this.replaceInstallments(id, installments)

    const updated = await this.getById(id)
    if (!updated) throw new ExpenseNotFoundError()
    return updated
  }

  async delete(id: string): Promise<void> {
    // expense_installments cascades via FK.
    const { error } = await this.client.from('expenses').delete().eq('id', id)
    if (error) throw error
  }
}
