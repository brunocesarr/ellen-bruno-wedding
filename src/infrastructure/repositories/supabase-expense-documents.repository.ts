import type { IExpenseDocumentsRepository } from '@/src/application/repositories/expense-documents.repository.interface'
import { ExpenseDocumentNotFoundError } from '@/src/entities/errors/expenses'
import type {
  CreateExpenseDocumentData,
  ExpenseDocument,
} from '@/src/entities/models/expense-document'
import type {
  ExpenseDocumentInsert,
  ExpenseDocumentRow,
} from '@/src/infrastructure/supabase/db-types'
import type { TypedSupabaseClient } from '@/src/infrastructure/supabase/types'

const mapRow = (r: ExpenseDocumentRow): ExpenseDocument => ({
  id: r.id,
  expenseId: r.expense_id,
  installmentId: r.installment_id,
  kind: r.kind,
  filePath: r.file_path,
  fileName: r.file_name,
  mimeType: r.mime_type,
  sizeBytes: r.size_bytes,
  createdAt: new Date(r.created_at),
})

export class SupabaseExpenseDocumentsRepository implements IExpenseDocumentsRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async list(): Promise<ExpenseDocument[]> {
    const { data, error } = await this.client
      .from('expense_documents')
      .select('*')
      .order('created_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map(mapRow)
  }

  async getById(id: string): Promise<ExpenseDocument | null> {
    const { data, error } = await this.client
      .from('expense_documents')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }

  async create(data: CreateExpenseDocumentData): Promise<ExpenseDocument> {
    const payload = {
      expense_id: data.expenseId,
      installment_id: data.installmentId,
      kind: data.kind,
      file_path: data.filePath,
      file_name: data.fileName,
      mime_type: data.mimeType,
      size_bytes: data.sizeBytes,
    } satisfies ExpenseDocumentInsert

    const { data: row, error } = await this.client
      .from('expense_documents')
      .insert(payload)
      .select('*')
      .single()
    if (error) throw error
    if (!row) throw new ExpenseDocumentNotFoundError()
    return mapRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('expense_documents')
      .delete()
      .eq('id', id)
    if (error) throw error
  }

  /**
   * Summed client-side rather than through an RPC: `size_bytes` is a single
   * int column over a table that holds tens of rows, so the round-trip cost is
   * the query itself, not the payload.
   */
  async totalSizeBytes(): Promise<number> {
    const { data, error } = await this.client
      .from('expense_documents')
      .select('size_bytes')
    if (error) throw error
    return (data ?? []).reduce((sum, r) => sum + (r.size_bytes ?? 0), 0)
  }
}
