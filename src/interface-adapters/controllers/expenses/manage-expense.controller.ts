import {
  createExpenseUseCase,
  deleteExpenseUseCase,
  updateExpenseUseCase,
} from '@/src/application/use-cases/expenses/manage-expense.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '../_handle'

export async function createExpenseController(input: unknown) {
  const c = await getContainer()
  return handle(() => createExpenseUseCase(c)(input))
}

export async function updateExpenseController(input: unknown) {
  const c = await getContainer()
  return handle(() => updateExpenseUseCase(c)(input))
}

export async function deleteExpenseController(id: string) {
  const c = await getContainer()
  return handle(() => deleteExpenseUseCase(c)(id))
}
