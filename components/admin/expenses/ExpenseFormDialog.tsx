'use client'

import {
  createExpenseAction,
  type ExpenseFormActionState,
  updateExpenseAction,
} from '@/app/admin/_actions/expenses.actions'
import { DialogShell } from '@/components/ui/DialogShell'
import { FormField as Field } from '@/components/ui/FormField'
import type { ExpenseViewModel } from '@/src/interface-adapters/view-models/expense.view-model'
import { inputField as inputClassName } from '@/src/lib/class-names'
import { formatCurrencyBRL } from '@/src/lib/format'
import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, Plus, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useActionState, useCallback, useMemo, useState } from 'react'

type Row = {
  key: string
  dueDate: string
  amount: string
  paidAmount: string
  paidBy: string
}

function emptyRow(): Row {
  return {
    key: crypto.randomUUID(),
    dueDate: '',
    amount: '',
    paidAmount: '0',
    paidBy: '',
  }
}

function rowsFromExpense(expense?: ExpenseViewModel): Row[] {
  if (!expense || expense.installments.length === 0) return [emptyRow()]
  return expense.installments.map((i) => ({
    key: i.id,
    dueDate: i.dueDate,
    amount: String(i.amount),
    paidAmount: String(i.paidAmount),
    paidBy: i.paidBy ?? '',
  }))
}

type Props = {
  trigger: React.ReactNode
  expense?: ExpenseViewModel
}

/**
 * There's no repeater precedent elsewhere in the admin dialogs (they're all
 * uncontrolled + defaultValue, per GiftFormDialog) — installment rows need
 * controlled state anyway to support add/remove and a live running total, so
 * this one dialog deliberately breaks from that pattern. Rows post as
 * parallel same-name fields (installmentDueDate, installmentAmount, ...),
 * zipped back into objects by position in expenses.actions.ts.
 */
export function ExpenseFormDialog({ trigger, expense }: Props) {
  const isEdit = Boolean(expense)
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<Row[]>(() => rowsFromExpense(expense))

  const total = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.amount) || 0), 0),
    [rows]
  )

  const updateRow = useCallback((key: string, patch: Partial<Row>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }, [])

  const addRow = useCallback(() => setRows((prev) => [...prev, emptyRow()]), [])

  const removeRow = useCallback((key: string) => {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.key !== key) : prev
    )
  }, [])

  const resetForm = useCallback(
    () => setRows(rowsFromExpense(expense)),
    [expense]
  )

  const submitAction = useCallback(
    async (
      previousState: ExpenseFormActionState,
      formData: FormData
    ): Promise<ExpenseFormActionState> => {
      const result = isEdit
        ? await updateExpenseAction(previousState, formData)
        : await createExpenseAction(previousState, formData)

      if (result?.ok) {
        resetForm()
        setOpen(false)
        router.refresh()
      }

      return result
    },
    [isEdit, resetForm, router]
  )

  const [state, formAction, isPending] = useActionState<
    ExpenseFormActionState,
    FormData
  >(submitAction, null)

  // handle() returns ValidationError as { error, issues }. z.flattenError only
  // keys fieldErrors by the FIRST path segment, so a per-row issue like
  // ['installments', i, 'paidAmount'] surfaces under fieldErrors.installments,
  // not a distinct per-row key — same behavior GiftFormDialog already relies
  // on for suggestedAmounts.
  const fieldErrors: Record<string, string[]> =
    state && !state.ok ? (state.issues?.fieldErrors ?? {}) : {}
  const formErrors: string[] =
    state && !state.ok ? (state.issues?.formErrors ?? []) : []
  const fieldError = (key: string): string | undefined => fieldErrors[key]?.[0]

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return
    setOpen(nextOpen)
    if (!nextOpen) resetForm()
  }

  return (
    <DialogShell
      trigger={trigger}
      open={open}
      onOpenChange={handleOpenChange}
      contentClassName="max-h-[92vh] w-[92vw] max-w-3xl"
    >
      <header className="flex items-start justify-between border-b border-stone-100 px-5 py-4 md:px-6">
        <div>
          <Dialog.Title className="font-serif text-xl text-stone-900">
            {isEdit ? 'Editar despesa' : 'Nova despesa'}
          </Dialog.Title>

          <Dialog.Description className="mt-1 text-xs text-stone-500">
            {isEdit
              ? 'Atualize os dados e as parcelas desta despesa.'
              : 'Cadastre um custo do casamento e sua forma de pagamento.'}
          </Dialog.Description>
        </div>

        <Dialog.Close
          disabled={isPending}
          className="rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </Dialog.Close>
      </header>

      <form
        action={formAction}
        className="max-h-[calc(92vh-76px)] overflow-y-auto p-5 md:p-6"
      >
        {expense?.id && <input type="hidden" name="id" value={expense.id} />}
        <input type="hidden" name="totalAmount" value={total.toFixed(2)} />

        <div className="space-y-5">
          <Field label="Descrição" error={fieldError('description')}>
            <input
              name="description"
              required
              defaultValue={expense?.description ?? ''}
              placeholder="Ex: Buffet, Decoração, Vestido..."
              disabled={isPending}
              className={inputClassName}
            />
          </Field>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-stone-600">
                Parcelas
              </span>
              <span className="text-xs text-stone-500">
                Total: <strong>{formatCurrencyBRL(total)}</strong>
              </span>
            </div>

            {fieldError('installments') && (
              <p className="mb-2 text-xs text-rose-600">
                {fieldError('installments')}
              </p>
            )}

            <div className="space-y-3">
              {rows.map((row, i) => (
                <div
                  key={row.key}
                  className="rounded-xl border border-stone-200 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-stone-400">
                      Parcela {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      disabled={isPending || rows.length <= 1}
                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Remover parcela"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4">
                    <Field label="Vencimento">
                      <input
                        type="date"
                        name="installmentDueDate"
                        required
                        value={row.dueDate}
                        onChange={(e) =>
                          updateRow(row.key, { dueDate: e.target.value })
                        }
                        disabled={isPending}
                        className={inputClassName}
                      />
                    </Field>

                    <Field label="Valor (R$)">
                      <input
                        type="number"
                        name="installmentAmount"
                        step="0.01"
                        min="0"
                        required
                        value={row.amount}
                        onChange={(e) =>
                          updateRow(row.key, { amount: e.target.value })
                        }
                        disabled={isPending}
                        className={inputClassName}
                      />
                    </Field>

                    <Field label="Pago (R$)">
                      <input
                        type="number"
                        name="installmentPaidAmount"
                        step="0.01"
                        min="0"
                        value={row.paidAmount}
                        onChange={(e) =>
                          updateRow(row.key, { paidAmount: e.target.value })
                        }
                        disabled={isPending}
                        className={inputClassName}
                      />
                    </Field>

                    <Field label="Pago por">
                      <input
                        name="installmentPaidBy"
                        value={row.paidBy}
                        onChange={(e) =>
                          updateRow(row.key, { paidBy: e.target.value })
                        }
                        placeholder="Ex: Bruno"
                        disabled={isPending}
                        className={inputClassName}
                      />
                    </Field>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRow}
              disabled={isPending}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700 transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> Adicionar parcela
            </button>
          </div>

          {state && !state.ok && (
            <div
              role="alert"
              className="space-y-1 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              <p className="font-medium">{state.error}</p>

              {formErrors.map((message) => (
                <p key={message} className="text-xs">
                  {message}
                </p>
              ))}
            </div>
          )}

          <footer className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Dialog.Close
              disabled={isPending}
              className="rounded-full px-5 py-2.5 text-sm text-stone-600 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </Dialog.Close>

            <button
              type="submit"
              disabled={isPending}
              className="
                inline-flex items-center justify-center gap-2 rounded-full
                bg-amber-700 px-6 py-2.5 text-sm font-medium text-white
                shadow-sm transition hover:bg-amber-600
                disabled:cursor-not-allowed disabled:opacity-60
              "
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}

              {isPending
                ? isEdit
                  ? 'Salvando...'
                  : 'Criando...'
                : isEdit
                  ? 'Salvar'
                  : 'Criar'}
            </button>
          </footer>
        </div>
      </form>
    </DialogShell>
  )
}
