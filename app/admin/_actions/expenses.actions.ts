'use server'

import { listExpensesController } from '@/src/interface-adapters/controllers/expenses/list-expenses.controller'
import {
  createExpenseController,
  deleteExpenseController,
  updateExpenseController,
} from '@/src/interface-adapters/controllers/expenses/manage-expense.controller'
import { getOptionalString } from '@/src/lib/form-data'
import { revalidateGroup } from '@/src/lib/revalidate'
import type { ActionResult } from '@/src/lib/server-action-result'

type ExpenseMutationResult = ActionResult<{ id: string; description: string }>

export type ExpenseFormActionState = ExpenseMutationResult | null

/**
 * Installment rows are submitted as parallel same-name fields
 * (`installmentDueDate`, `installmentAmount`, ...) rather than indexed/bracketed
 * names — there's no existing repeater pattern in this codebase to follow, and
 * removing a row in the dialog removes all of its inputs together, so the
 * parallel arrays stay aligned by position.
 */
function readInstallments(formData: FormData) {
  const dueDates = formData.getAll('installmentDueDate')
  const amounts = formData.getAll('installmentAmount')
  const paidAmounts = formData.getAll('installmentPaidAmount')
  const paidBys = formData.getAll('installmentPaidBy')

  return dueDates.map((dueDate, i) => ({
    dueDate: String(dueDate),
    amount: String(amounts[i] ?? ''),
    paidAmount: String(paidAmounts[i] ?? '0'),
    paidBy: String(paidBys[i] ?? ''),
  }))
}

export async function createExpenseAction(
  _: unknown,
  formData: FormData
): Promise<ExpenseFormActionState> {
  const result = await createExpenseController({
    description: getOptionalString(formData, 'description'),
    totalAmount: getOptionalString(formData, 'totalAmount'),
    installments: readInstallments(formData),
  })

  if (result.ok) revalidateGroup('expenses')
  return result
}

export async function updateExpenseAction(
  _: unknown,
  formData: FormData
): Promise<ExpenseFormActionState> {
  const result = await updateExpenseController({
    id: getOptionalString(formData, 'id'),
    description: getOptionalString(formData, 'description'),
    totalAmount: getOptionalString(formData, 'totalAmount'),
    installments: readInstallments(formData),
  })

  if (result.ok) revalidateGroup('expenses')
  return result
}

export async function deleteExpenseAction(id: string) {
  const result = await deleteExpenseController(id)
  if (result.ok) revalidateGroup('expenses')
  return result
}

export async function listExpensesAction() {
  return listExpensesController()
}
