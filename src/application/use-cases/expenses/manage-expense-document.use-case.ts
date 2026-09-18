import type { IExpenseDocumentsRepository } from '@/src/application/repositories/expense-documents.repository.interface'
import type { IExpensesRepository } from '@/src/application/repositories/expenses.repository.interface'
import type { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import {
  ExpenseDocumentNotFoundError,
  ExpenseDocumentsQuotaExceededError,
  ExpenseNotFoundError,
} from '@/src/entities/errors/expenses'
import {
  UploadExpenseDocumentInputSchema,
  type ExpenseDocument,
} from '@/src/entities/models/expense-document'
import {
  EXPENSE_DOCUMENTS_STORAGE_BUDGET_BYTES,
  EXPENSE_DOCUMENT_SIGNED_URL_TTL_SECONDS,
} from '@/src/lib/constants'
import { z } from 'zod'

type Deps = {
  expenseDocumentsRepo: IExpenseDocumentsRepository
  expensesRepo: IExpensesRepository
  documentStorageRepo: IStorageRepository
  authService: IAuthService
}

/**
 * Records a document whose bytes are already in storage.
 *
 * The quota check runs here rather than in the action so that a direct POST to
 * the server action cannot bypass it. The caller still owns the cleanup: every
 * throw below leaves an uploaded object behind, which is why
 * `uploadExpenseDocumentAction` awaits `cleanup()` on any failure.
 */
export function uploadExpenseDocumentUseCase(d: Deps) {
  return async (raw: unknown): Promise<ExpenseDocument> => {
    if (!(await d.authService.getCurrentUser())) {
      throw new UnauthenticatedError()
    }

    const result = UploadExpenseDocumentInputSchema.safeParse(raw)
    if (!result.success) throw new ValidationError(z.flattenError(result.error))
    const input = result.data

    const expense = await d.expensesRepo.getById(input.expenseId)
    if (!expense) throw new ExpenseNotFoundError()

    // Guards against a comprovante being pinned to a parcela of a *different*
    // expense, which the DB alone would happily accept.
    if (
      input.installmentId &&
      !expense.installments.some((i) => i.id === input.installmentId)
    ) {
      throw new ValidationError({
        formErrors: ['Parcela não pertence a esta despesa.'],
        fieldErrors: {},
      })
    }

    const used = await d.expenseDocumentsRepo.totalSizeBytes()
    if (used + input.sizeBytes > EXPENSE_DOCUMENTS_STORAGE_BUDGET_BYTES) {
      throw new ExpenseDocumentsQuotaExceededError(
        used,
        EXPENSE_DOCUMENTS_STORAGE_BUDGET_BYTES
      )
    }

    return d.expenseDocumentsRepo.create(input)
  }
}

/** Removes the row and the stored bytes — an orphan on either side is a leak. */
export function deleteExpenseDocumentUseCase(d: Deps) {
  return async (id: string): Promise<void> => {
    if (!(await d.authService.getCurrentUser())) {
      throw new UnauthenticatedError()
    }

    const document = await d.expenseDocumentsRepo.getById(id)
    if (!document) throw new ExpenseDocumentNotFoundError()

    await d.expenseDocumentsRepo.delete(id)

    // Row first, bytes second: a failure here costs quota, a failure the other
    // way around would leave a row pointing at nothing.
    try {
      await d.documentStorageRepo.remove(document.filePath)
    } catch (error) {
      console.error(
        '[deleteExpenseDocumentUseCase] storage remove failed',
        error
      )
    }
  }
}

/**
 * Minted on demand, one document at a time, instead of being baked into the
 * list view model: the despesas page renders every document as a chip, and
 * pre-signing all of them would be a storage round-trip per chip on every
 * render for links most visits never click.
 */
export function getExpenseDocumentUrlUseCase(d: Deps) {
  return async (id: string): Promise<{ url: string; fileName: string }> => {
    if (!(await d.authService.getCurrentUser())) {
      throw new UnauthenticatedError()
    }

    const document = await d.expenseDocumentsRepo.getById(id)
    if (!document) throw new ExpenseDocumentNotFoundError()

    const url = await d.documentStorageRepo.createSignedUrl(
      document.filePath,
      EXPENSE_DOCUMENT_SIGNED_URL_TTL_SECONDS
    )

    return { url, fileName: document.fileName }
  }
}
