import { listExpensesUseCase } from '@/src/application/use-cases/expenses/list-expenses.use-case'
import { getContainer } from '@/src/di/container'
import {
  ExpenseViewModel,
  toExpenseViewModel,
} from '../../view-models/expense.view-model'
import { handle } from '../_handle'

export async function listExpensesController(): Promise<
  { ok: true; data: ExpenseViewModel[] } | { ok: false; error: string }
> {
  const c = await getContainer()
  return handle(async () => {
    const list = await listExpensesUseCase(c)()
    return list.map(toExpenseViewModel)
  })
}
