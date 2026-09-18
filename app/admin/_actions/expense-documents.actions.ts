'use server'

import { getContainer } from '@/src/di/container'
import {
  deleteExpenseDocumentController,
  getExpenseDocumentUrlController,
  uploadExpenseDocumentController,
} from '@/src/interface-adapters/controllers/expenses/manage-expense-document.controller'
import type { ExpenseDocumentViewModel } from '@/src/interface-adapters/view-models/expense-document.view-model'
import { uploadExpenseDocument } from '@/src/lib/document-upload'
import { getFile, getOptionalString, getString } from '@/src/lib/form-data'
import { revalidateGroup } from '@/src/lib/revalidate'
import type { ActionResult } from '@/src/lib/server-action-result'

export type ExpenseDocumentFormActionState =
  ActionResult<ExpenseDocumentViewModel> | null

/**
 * Bytes first, row second — the same ordering as `upsertSiteImageAction`. Every
 * failure after the upload (validation, the storage-budget check, a dead
 * connection) has to `cleanup()`, or the object sits in the bucket forever with
 * nothing referencing it.
 */
export async function uploadExpenseDocumentAction(
  _: unknown,
  formData: FormData
): Promise<ExpenseDocumentFormActionState> {
  const expenseId = getString(formData, 'expenseId')
  if (!expenseId) return { ok: false, error: 'Despesa inválida.' }

  const { documentStorageRepo } = await getContainer()
  const upload = await uploadExpenseDocument(
    documentStorageRepo,
    getFile(formData, 'file'),
    expenseId
  )
  if (!upload.ok) return { ok: false, error: upload.error }

  const result = await uploadExpenseDocumentController({
    expenseId,
    installmentId: getOptionalString(formData, 'installmentId') ?? null,
    kind: getString(formData, 'kind'),
    filePath: upload.document.filePath,
    fileName: upload.document.fileName,
    mimeType: upload.document.mimeType,
    sizeBytes: upload.document.sizeBytes,
  })

  if (!result.ok) await upload.document.cleanup()
  else revalidateGroup('expenses')

  return result
}

export async function deleteExpenseDocumentAction(id: string) {
  const result = await deleteExpenseDocumentController(id)
  if (result.ok) revalidateGroup('expenses')
  return result
}

/**
 * Minted per click rather than per render — see the note on
 * `getExpenseDocumentUrlUseCase`. Not a mutation, so it deliberately does not
 * revalidate anything.
 */
export async function getExpenseDocumentUrlAction(id: string) {
  return getExpenseDocumentUrlController(id)
}
