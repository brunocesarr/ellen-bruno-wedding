import { getDashboardStatsAction } from '@/app/admin/_actions/dashboard.actions'
import { listUntiedPixAction } from '@/app/admin/_actions/pix.actions'
import { DonutChart } from '@/components/admin/charts/DonutChart'
import { ReservationsChart } from '@/components/admin/charts/ReservationsChart'
import { SectionCard } from '@/components/admin/SectionCard'
import { StatCard } from '@/components/admin/StatCard'
import { formatCurrencyBRL } from '@/src/lib/format'
import { GIFT_CATEGORY_LABELS } from '@/src/lib/gift-categories'
import { unwrapForPage } from '@/src/lib/server-action-result'
import { Download } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ResumoPage() {
  const stats = unwrapForPage(await getDashboardStatsAction())
  const untiedPayments = unwrapForPage(await listUntiedPixAction())

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-stone-900 md:text-4xl">
            Resumo Geral
          </h1>
          <p className="mt-1 text-stone-500">Visão completa do casamento.</p>
        </div>
        <a
          href="/api/admin/export"
          className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
        >
          <Download className="h-4 w-4" /> Exportar CSV
        </a>
      </header>

      <SectionCard title="📋 Panorama geral" description="Tudo em um só lugar">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Convidados"
            value={stats.guestsSummary.total}
            hint={`${stats.guestsSummary.going} confirmados`}
            accent="stone"
          />
          <StatCard
            label="Solicitações"
            value={stats.requestsSummary.total}
            hint={
              stats.requestsSummary.pending > 0
                ? `${stats.requestsSummary.pending} aguardando`
                : undefined
            }
            accent="amber"
          />
          <StatCard
            label="Receitas"
            value={formatCurrencyBRL(stats.totalReceived)}
            hint="Presentes confirmados"
            accent="emerald"
          />
          <StatCard
            label="Despesas"
            value={formatCurrencyBRL(stats.totalExpensesPaid)}
            hint={`de ${formatCurrencyBRL(stats.totalExpenses)} previstos`}
            accent="rose"
          />
        </div>
        <p className="mt-4 text-sm text-stone-500">
          Saldo (recebido − pago):{' '}
          <strong
            className={
              stats.netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }
          >
            {formatCurrencyBRL(stats.netBalance)}
          </strong>
        </p>
      </SectionCard>

      <SectionCard
        title="💰 Presentes por categoria"
        description="Valor recebido e comprometido, por categoria"
        action={
          <a
            href="/api/admin/reports/gifts-by-category"
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            <Download className="h-4 w-4" /> Baixar PDF
          </a>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-2 pr-4 font-medium">Categoria</th>
                <th className="py-2 pr-4 font-medium">Presentes</th>
                <th className="py-2 pr-4 font-medium">Recebido</th>
                <th className="py-2 font-medium">Comprometido</th>
              </tr>
            </thead>
            <tbody>
              {stats.giftsByCategory.map((c) => (
                <tr key={c.category} className="border-b border-stone-100">
                  <td className="py-2 pr-4">
                    {GIFT_CATEGORY_LABELS[c.category]}
                  </td>
                  <td className="py-2 pr-4">{c.giftCount}</td>
                  <td className="py-2 pr-4">
                    {formatCurrencyBRL(c.confirmedTotal)}
                  </td>
                  <td className="py-2">{formatCurrencyBRL(c.pledgedTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="🎁 Presentes">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Cadastrados"
              value={stats.totalGifts}
              accent="amber"
            />
            <StatCard
              label="Reservados"
              value={stats.reservedGifts}
              accent="emerald"
            />
            <StatCard
              label="Valor total"
              value={formatCurrencyBRL(stats.totalGiftValue)}
              accent="stone"
            />
            <StatCard
              label="Já recebido"
              value={formatCurrencyBRL(stats.totalReceived)}
              accent="rose"
            />
          </div>
          <div className="mt-6">
            <DonutChart
              data={[
                {
                  label: 'Pendentes',
                  value: stats.byStatus.pending,
                  color: '#d4a574',
                },
                {
                  label: 'Reservados',
                  value: stats.byStatus.reserved,
                  color: '#65a37e',
                },
                {
                  label: 'Agradecidos',
                  value: stats.byStatus.thanked,
                  color: '#a8763e',
                },
              ]}
            />
          </div>
        </SectionCard>

        <SectionCard title="💌 Confirmações">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Confirmados"
              value={stats.confirmedCount}
              accent="emerald"
            />
            <StatCard
              label="Pendentes"
              value={stats.pendingCount}
              accent="amber"
            />
            <StatCard
              label="Recusados"
              value={stats.declinedCount}
              accent="rose"
            />
            <StatCard
              label="Pessoas"
              value={stats.totalGuests}
              accent="stone"
            />
          </div>
          <div className="mt-6">
            <DonutChart
              data={[
                {
                  label: 'Confirmados',
                  value: stats.confirmedCount,
                  color: '#65a37e',
                },
                {
                  label: 'Pendentes',
                  value: stats.pendingCount,
                  color: '#d4a574',
                },
                {
                  label: 'Recusados',
                  value: stats.declinedCount,
                  color: '#c97168',
                },
              ]}
            />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="📈 Linha do tempo de reservas"
        description="Últimos 30 dias"
      >
        <ReservationsChart data={stats.timeline} />
      </SectionCard>

      {untiedPayments.length > 0 && (
        <SectionCard
          title="⚠️ Pagamentos sem presente vinculado"
          description="Confirmados, mas o presente já não estava mais disponível quando o pagamento chegou. Verifique e reembolse pelo painel do provedor correspondente (Mercado Pago ou PagBank) se necessário."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-2 pr-4 font-medium">Convidado</th>
                  <th className="py-2 pr-4 font-medium">Valor</th>
                  <th className="py-2 pr-4 font-medium">Método</th>
                  <th className="py-2 pr-4 font-medium">Provedor</th>
                  <th className="py-2 pr-4 font-medium">ID do pagamento</th>
                  <th className="py-2 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {untiedPayments.map((p) => (
                  <tr key={p.id} className="border-b border-stone-100">
                    <td className="py-2 pr-4">{p.guestName}</td>
                    <td className="py-2 pr-4">{formatCurrencyBRL(p.amount)}</td>
                    <td className="py-2 pr-4 uppercase">{p.paymentMethod}</td>
                    <td className="py-2 pr-4">
                      {p.paymentProvider === 'pagbank'
                        ? 'PagBank'
                        : p.paymentProvider === 'mercado_pago'
                          ? 'Mercado Pago'
                          : '—'}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">
                      {p.mpPaymentId ?? p.pagbankPaymentId ?? '—'}
                    </td>
                    <td className="py-2">
                      {p.createdAt.toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  )
}
