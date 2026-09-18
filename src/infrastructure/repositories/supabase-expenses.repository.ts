import type {
  ExpenseWriteResult,
  IExpensesRepository,
} from '@/src/application/repositories/expenses.repository.interface'
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

  /** Storage keys of the documents hanging off these installments. */
  private async documentPathsForInstallments(
    installmentIds: string[]
  ): Promise<string[]> {
    if (installmentIds.length === 0) return []
    const { data, error } = await this.client
      .from('expense_documents')
      .select('file_path')
      .in('installment_id', installmentIds)
    if (error) throw error
    return (data ?? []).map((r) => r.file_path)
  }

  /**
   * Reconciles the submitted rows against what is stored instead of wiping and
   * re-inserting: `expense_documents.installment_id` references these rows with
   * `on delete cascade`, so a delete-all would take every comprovante with it
   * on any edit — even one that only fixed a typo in the description.
   *
   * A submitted id that does not belong to this expense is treated as a new
   * row rather than trusted, so a tampered form can never repoint someone
   * else's installment.
   */
  private async syncInstallments(
    expenseId: string,
    installments: UpdateExpenseInput['installments']
  ): Promise<{ orphanedDocumentPaths: string[] }> {
    const { data: existing, error: existingError } = await this.client
      .from('expense_installments')
      .select('id')
      .eq('expense_id', expenseId)
    if (existingError) throw existingError

    const existingIds = new Set((existing ?? []).map((r) => r.id))
    const keptIds = new Set<string>()
    const toUpdate: { id: string; row: ExpenseInstallmentInsert }[] = []
    const toInsert: ExpenseInstallmentInsert[] = []

    for (const i of installments) {
      const row = {
        expense_id: expenseId,
        due_date: i.dueDate,
        amount: i.amount,
        paid_amount: i.paidAmount,
        paid_by: i.paidBy ?? null,
      } satisfies ExpenseInstallmentInsert

      if (i.id && existingIds.has(i.id) && !keptIds.has(i.id)) {
        keptIds.add(i.id)
        toUpdate.push({ id: i.id, row })
      } else {
        toInsert.push(row)
      }
    }

    const toDelete = [...existingIds].filter((id) => !keptIds.has(id))
    const orphanedDocumentPaths =
      await this.documentPathsForInstallments(toDelete)

    if (toDelete.length > 0) {
      const { error } = await this.client
        .from('expense_installments')
        .delete()
        .in('id', toDelete)
      if (error) throw error
    }

    for (const { id, row } of toUpdate) {
      const { error } = await this.client
        .from('expense_installments')
        .update(row)
        .eq('id', id)
        .eq('expense_id', expenseId)
      if (error) throw error
    }

    if (toInsert.length > 0) {
      const { error } = await this.client
        .from('expense_installments')
        .insert(toInsert)
      if (error) throw error
    }

    return { orphanedDocumentPaths }
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

    await this.syncInstallments(row.id, data.installments)

    const created = await this.getById(row.id)
    if (!created) throw new ExpenseNotFoundError()
    return created
  }

  async update(data: UpdateExpenseInput): Promise<ExpenseWriteResult> {
    const { id, installments, ...rest } = data

    const { error } = await this.client
      .from('expenses')
      .update({
        description: rest.description,
        total_amount: rest.totalAmount,
      } satisfies ExpenseInsert)
      .eq('id', id)
    if (error) throw error

    const { orphanedDocumentPaths } = await this.syncInstallments(
      id,
      installments
    )

    const updated = await this.getById(id)
    if (!updated) throw new ExpenseNotFoundError()
    return { expense: updated, orphanedDocumentPaths }
  }

  async delete(id: string): Promise<{ orphanedDocumentPaths: string[] }> {
    // Read the storage keys first: the rows holding them are gone the moment
    // the expense is deleted (expense_documents cascades on expense_id).
    const { data: documents, error: documentsError } = await this.client
      .from('expense_documents')
      .select('file_path')
      .eq('expense_id', id)
    if (documentsError) throw documentsError

    // expense_installments and expense_documents cascade via FK.
    const { error } = await this.client.from('expenses').delete().eq('id', id)
    if (error) throw error

    return {
      orphanedDocumentPaths: (documents ?? []).map((r) => r.file_path),
    }
  }
}
