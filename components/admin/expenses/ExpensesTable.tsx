'use client'

import { deleteExpenseAction } from '@/app/admin/_actions/expenses.actions'
import { EmptyState } from '@/components/ui/EmptyState'
import type {
  ExpenseViewModel,
  InstallmentViewModel,
} from '@/src/interface-adapters/view-models/expense.view-model'
import {
  ChevronDown,
  ChevronRight,
  Pencil,
  Receipt,
  Search,
  Trash2,
} from 'lucide-react'
import { Fragment, useMemo, useState, useTransition } from 'react'
import { ExpenseFormDialog } from './ExpenseFormDialog'

const STATUS_TONE = {
  quitado: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  parcial: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  pendente: 'bg-stone-100 text-stone-700 ring-1 ring-stone-200',
} as const

const STATUS_LABEL = {
  quitado: 'Quitado',
  parcial: 'Parcial',
  pendente: 'Pendente',
} as const

function ExpenseStatusBadge({ status }: { status: keyof typeof STATUS_TONE }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TONE[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  )
}

function InstallmentRow({
  installment,
}: {
  installment: InstallmentViewModel
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 px-4 py-2 text-xs first:border-t-0">
      <span
        className={
          installment.isOverdue ? 'font-medium text-rose-600' : 'text-stone-500'
        }
      >
        {installment.dueDateLabel}
        {installment.isOverdue && ' · atrasada'}
      </span>
      <span className="text-stone-700">
        {installment.paidAmountLabel} de {installment.amountLabel}
      </span>
      <span className="text-stone-400">{installment.paidBy || '—'}</span>
    </div>
  )
}

export function ExpensesTable({ expenses }: { expenses: ExpenseViewModel[] }) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [, startTransition] = useTransition()

  const filtered = useMemo(
    () =>
      expenses.filter(
        (e) =>
          !query || e.description.toLowerCase().includes(query.toLowerCase())
      ),
    [expenses, query]
  )

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!expenses.length) {
    return (
      <EmptyState
        icon={<Receipt className="h-4 w-4" />}
        title="Nenhuma despesa cadastrada"
        description="Comecem registrando os custos do casamento — buffet, decoração, local..."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="search"
          placeholder="Buscar por descrição..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-full border border-stone-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-amber-600"
        />
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-stone-400">
              <th className="px-4 py-3 font-medium" />
              <th className="px-4 py-3 font-medium">Despesa</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Pago</th>
              <th className="px-4 py-3 font-medium">Saldo</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((e) => {
              const isOpen = expanded.has(e.id)
              return (
                <Fragment key={e.id}>
                  <tr className="transition-colors hover:bg-stone-50/60">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggle(e.id)}
                        className="rounded-lg p-1 text-stone-400 hover:bg-stone-100"
                        aria-label={
                          isOpen ? 'Ocultar parcelas' : 'Ver parcelas'
                        }
                      >
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-800">
                        {e.description}
                      </p>
                      <p className="text-xs text-stone-400">
                        {e.installments.length} parcela(s)
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium tabular-nums text-stone-800">
                      {e.totalAmountLabel}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-emerald-700">
                      {e.paidTotalLabel}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-stone-600">
                      {e.outstandingLabel}
                    </td>
                    <td className="px-4 py-3">
                      <ExpenseStatusBadge status={e.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <ExpenseFormDialog
                          expense={e}
                          trigger={
                            <button
                              className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          }
                        />
                        <button
                          onClick={() => {
                            if (!confirm(`Remover "${e.description}"?`)) return
                            startTransition(() => {
                              deleteExpenseAction(e.id)
                            })
                          }}
                          className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                          aria-label="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={7} className="bg-stone-50/60 px-4 py-2">
                        <div className="overflow-hidden rounded-lg bg-white">
                          {e.installments.map((i) => (
                            <InstallmentRow key={i.id} installment={i} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {filtered.map((e) => (
          <article
            key={e.id}
            className="rounded-xl border border-stone-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-stone-800">{e.description}</p>
                <p className="text-xs text-stone-400">
                  {e.installments.length} parcela(s)
                </p>
              </div>
              <ExpenseStatusBadge status={e.status} />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-stone-400">Total</p>
                <p className="font-medium text-stone-800">
                  {e.totalAmountLabel}
                </p>
              </div>
              <div>
                <p className="text-stone-400">Pago</p>
                <p className="font-medium text-emerald-700">
                  {e.paidTotalLabel}
                </p>
              </div>
              <div>
                <p className="text-stone-400">Saldo</p>
                <p className="font-medium text-stone-800">
                  {e.outstandingLabel}
                </p>
              </div>
            </div>

            <button
              onClick={() => toggle(e.id)}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-amber-700"
            >
              {expanded.has(e.id) ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              {expanded.has(e.id) ? 'Ocultar parcelas' : 'Ver parcelas'}
            </button>

            {expanded.has(e.id) && (
              <div className="mt-2 overflow-hidden rounded-lg bg-stone-50">
                {e.installments.map((i) => (
                  <InstallmentRow key={i.id} installment={i} />
                ))}
              </div>
            )}

            <div className="mt-3 flex justify-end gap-2">
              <ExpenseFormDialog
                expense={e}
                trigger={
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-sm text-stone-700">
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>
                }
              />
              <button
                onClick={() => {
                  if (!confirm(`Remover "${e.description}"?`)) return
                  startTransition(() => {
                    deleteExpenseAction(e.id)
                  })
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-sm text-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remover
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
