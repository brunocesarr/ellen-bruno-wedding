import { listExpensesAction } from '@/app/admin/_actions/expenses.actions'
import { ExpenseFormDialog } from '@/components/admin/expenses/ExpenseFormDialog'
import { ExpensesTable } from '@/components/admin/expenses/ExpensesTable'
import { SectionCard } from '@/components/admin/SectionCard'
import { StatCard } from '@/components/admin/StatCard'
import { buttonPrimary } from '@/src/lib/class-names'
import { EXPENSE_DOCUMENTS_STORAGE_BUDGET_BYTES } from '@/src/lib/constants'
import { formatBytes, formatCurrencyBRL } from '@/src/lib/format'
import { unwrapForPage } from '@/src/lib/server-action-result'
import { cn } from '@/src/lib/utils'
import { CalendarClock, HardDrive, Plus, Receipt, Wallet } from 'lucide-react'

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

  // Documents are the only thing on this page that consumes the Supabase free
  // tier, so the gauge lives here rather than on the dashboard: the people who
  // upload contracts are the ones who need to see the budget filling up.
  const documentsBytes = expenses.reduce((s, e) => s + e.documentsSizeBytes, 0)
  const documentCount = expenses.reduce((s, e) => s + e.documentCount, 0)
  const documentsPercent = Math.min(
    100,
    Math.round((documentsBytes / EXPENSE_DOCUMENTS_STORAGE_BUDGET_BYTES) * 100)
  )

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

      <SectionCard
        title="Documentos"
        description="Contratos e comprovantes anexados às despesas."
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-2 text-stone-600">
            <HardDrive className="h-4 w-4 text-stone-400" />
            {documentCount} arquivo(s)
          </span>
          <span className="tabular-nums text-stone-500">
            {formatBytes(documentsBytes)} de{' '}
            {formatBytes(EXPENSE_DOCUMENTS_STORAGE_BUDGET_BYTES)} ·{' '}
            {documentsPercent}%
          </span>
        </div>

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100"
          role="progressbar"
          aria-valuenow={documentsPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Armazenamento de documentos utilizado"
        >
          <div
            className={
              documentsPercent >= 90
                ? 'h-full rounded-full bg-rose-500'
                : documentsPercent >= 70
                  ? 'h-full rounded-full bg-amber-500'
                  : 'h-full rounded-full bg-emerald-500'
            }
            style={{ width: `${Math.max(documentsPercent, 1)}%` }}
          />
        </div>

        <p className="mt-2 text-xs text-stone-400">
          Imagens são comprimidas antes do envio e os arquivos ficam em um
          bucket privado — novos envios são bloqueados ao atingir o limite.
        </p>
      </SectionCard>

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
