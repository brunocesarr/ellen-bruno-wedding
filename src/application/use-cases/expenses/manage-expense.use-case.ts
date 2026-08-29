import type { IExpensesRepository } from '@/src/application/repositories/expenses.repository.interface'
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
  authService: IAuthService
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

    return d.expensesRepo.update(result.data)
  }
}

export function deleteExpenseUseCase(d: Deps) {
  return async (id: string) => {
    if (!(await d.authService.getCurrentUser())) {
      throw new UnauthenticatedError()
    }

    return d.expensesRepo.delete(id)
  }
}
