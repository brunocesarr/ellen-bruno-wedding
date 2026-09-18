import {
  deleteExpenseDocumentUseCase,
  getExpenseDocumentUrlUseCase,
  uploadExpenseDocumentUseCase,
} from '@/src/application/use-cases/expenses/manage-expense-document.use-case'
import { getContainer } from '@/src/di/container'
import { toExpenseDocumentViewModel } from '../../view-models/expense-document.view-model'
import { handle } from '../_handle'

export async function uploadExpenseDocumentController(input: unknown) {
  const c = await getContainer()
  return handle(async () =>
    toExpenseDocumentViewModel(await uploadExpenseDocumentUseCase(c)(input))
  )
}

export async function deleteExpenseDocumentController(id: string) {
  const c = await getContainer()
  return handle(() => deleteExpenseDocumentUseCase(c)(id))
}

export async function getExpenseDocumentUrlController(id: string) {
  const c = await getContainer()
  return handle(() => getExpenseDocumentUrlUseCase(c)(id))
}
