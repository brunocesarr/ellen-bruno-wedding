import { listExpensesAction } from '@/app/admin/_actions/expenses.actions'
import { ExpenseFormDialog } from '@/components/admin/expenses/ExpenseFormDialog'
import { ExpensesTable } from '@/components/admin/expenses/ExpensesTable'
import { SectionCard } from '@/components/admin/SectionCard'
import { StatCard } from '@/components/admin/StatCard'
import { buttonPrimary } from '@/src/lib/class-names'
import { formatCurrencyBRL } from '@/src/lib/format'
import { unwrapForPage } from '@/src/lib/server-action-result'
import { cn } from '@/src/lib/utils'
import { CalendarClock, Plus, Receipt, Wallet } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DespesasPage() {
  const expenses = unwrapForPage(await listExpensesAction()).sort((a, b) =>
    a.description.localeCompare(b.description)
  )

  const totalCost = expenses.reduce((s, e) => s + e.totalAmount, 0)
  const totalPaid = expenses.reduce((s, e) => s + e.paidTotal, 0)
  const outstanding = expenses.reduce((s, e) => s + e.outstanding, 0)

  const upcoming = expenses
    .flatMap((e) =>
      e.installments
        .filter((i) => i.status !== 'paid')
        .map((i) => ({ ...i, description: e.description }))
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6)

  const nextDue = upcoming[0]

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-stone-900 md:text-4xl">
            Despesas do Casamento
          </h1>
          <p className="mt-1 text-stone-500">
            Acompanhem os custos, parcelas e pagamentos do planejamento.
          </p>
        </div>
        <ExpenseFormDialog
          trigger={
            <button className={cn(buttonPrimary, 'py-2.5')}>
              <Plus className="h-4 w-4" /> Nova despesa
            </button>
          }
        />
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Custo total"
          value={formatCurrencyBRL(totalCost)}
          icon={<Receipt className="h-4 w-4" />}
        />
        <StatCard
          label="Total pago"
          value={formatCurrencyBRL(totalPaid)}
          icon={<Wallet className="h-4 w-4" />}
          accent="emerald"
        />
        <StatCard
          label="Saldo devedor"
          value={formatCurrencyBRL(outstanding)}
          accent="rose"
        />
        <StatCard
          label="Próximo vencimento"
          value={nextDue ? nextDue.dueDateLabel : '—'}
          hint={nextDue ? nextDue.description : 'Nenhuma parcela pendente'}
          icon={<CalendarClock className="h-4 w-4" />}
          accent="amber"
        />
      </div>

      {upcoming.length > 0 && (
        <SectionCard
          title="Próximos vencimentos"
          description="Parcelas pendentes ou parciais, da mais próxima para a mais distante."
        >
          <div className="divide-y divide-stone-100">
            {upcoming.map((i) => (
              <div
                key={i.id}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-800">
                    {i.description}
                  </p>
                  <p
                    className={
                      i.isOverdue
                        ? 'text-xs font-medium text-rose-600'
                        : 'text-xs text-stone-400'
                    }
                  >
                    {i.dueDateLabel}
                    {i.isOverdue && ' · atrasada'}
                  </p>
                </div>
                <p className="whitespace-nowrap tabular-nums text-stone-600">
                  {i.paidAmountLabel} de {i.amountLabel}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <SectionCard
        title="Todas as despesas"
        description={`${expenses.length} despesa(s) cadastrada(s)`}
      >
        <ExpensesTable expenses={expenses} />
      </SectionCard>
    </div>
  )
}
