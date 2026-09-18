import type { IExpensesRepository } from '@/src/application/repositories/expenses.repository.interface'
import type { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import {
  CreateExpenseInputSchema,
  UpdateExpenseInputSchema,
} from '@/src/entities/models/expense'
import { z } from 'zod'

type Deps = {
  expensesRepo: IExpensesRepository
  documentStorageRepo: IStorageRepository
  authService: IAuthService
}

/**
 * Postgres cascades the document *rows* away; nothing cascades the bytes.
 * Best-effort on purpose — the write has already committed, so a storage
 * hiccup must not turn a successful edit into a failed one. The worst case is
 * an unreferenced object counting against the free-tier budget.
 */
async function removeOrphanedDocuments(
  storage: IStorageRepository,
  paths: string[]
): Promise<void> {
  for (const path of paths) {
    try {
      await storage.remove(path)
    } catch (error) {
      console.error('[manage-expense] orphaned document remove failed', error)
    }
  }
}

export function createExpenseUseCase(d: Deps) {
  return async (raw: unknown) => {
    if (!(await d.authService.getCurrentUser())) {
      throw new UnauthenticatedError()
    }

    const result = CreateExpenseInputSchema.safeParse(raw)
    if (!result.success) throw new ValidationError(z.flattenError(result.error))

    return d.expensesRepo.create(result.data)
  }
}

export function updateExpenseUseCase(d: Deps) {
  return async (raw: unknown) => {
    if (!(await d.authService.getCurrentUser())) {
      throw new UnauthenticatedError()
    }

    const result = UpdateExpenseInputSchema.safeParse(raw)
    if (!result.success) throw new ValidationError(z.flattenError(result.error))

    const { expense, orphanedDocumentPaths } = await d.expensesRepo.update(
      result.data
    )
    await removeOrphanedDocuments(d.documentStorageRepo, orphanedDocumentPaths)
    return expense
  }
}

export function deleteExpenseUseCase(d: Deps) {
  return async (id: string) => {
    if (!(await d.authService.getCurrentUser())) {
      throw new UnauthenticatedError()
    }

    const { orphanedDocumentPaths } = await d.expensesRepo.delete(id)
    await removeOrphanedDocuments(d.documentStorageRepo, orphanedDocumentPaths)
  }
}
