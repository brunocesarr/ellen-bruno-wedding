import { AdminPageTransition } from '@/components/admin/AdminPageTransition'
import { SectionCard } from '@/components/admin/SectionCard'
import { StatCard } from '@/components/admin/StatCard'
import { StatusPill } from '@/components/admin/StatusPill'
import { DonutChart } from '@/components/admin/charts/DonutChart'
import { ReservationsChart } from '@/components/admin/charts/ReservationsChart'
import { formatCurrencyBRL, formatRelativeTime } from '@/src/lib/format'
import { unwrapForPage } from '@/src/lib/server-action-result'
import {
  Bell,
  Gift,
  HeartHandshake,
  MessageCircleHeart,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { getDashboardStatsAction } from '../_actions/dashboard.actions'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const stats = unwrapForPage(await getDashboardStatsAction())

  return (
    <AdminPageTransition>
      <div className="space-y-6">
        <header>
          <h1 className="font-serif text-3xl text-stone-900 md:text-4xl">
            Bem-vindos, Ellen & Bruno 👋
          </h1>
          <p className="mt-1 text-stone-500">
            Acompanhem em tempo real as confirmações, presentes e mensagens dos
            convidados.
          </p>
        </header>

        {stats.requestsSummary.pending > 0 && (
          <Link
            href="/admin/solicitacoes"
            className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800 transition hover:bg-amber-100"
          >
            <span className="flex items-center gap-3">
              <Bell className="h-4 w-4 flex-shrink-0" />
              <span>
                <strong className="font-semibold">
                  {stats.requestsSummary.pending}
                </strong>{' '}
                {stats.requestsSummary.pending === 1
                  ? 'solicitação de convite aguardando aprovação'
                  : 'solicitações de convite aguardando aprovação'}
              </span>
            </span>
            <span className="flex-shrink-0 font-medium underline-offset-2 hover:underline">
              Revisar →
            </span>
          </Link>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            index={0}
            label="Confirmados"
            value={stats.confirmedCount}
            icon={<HeartHandshake className="h-4 w-4" />}
            accent="emerald"
          />
          <StatCard
            index={1}
            label="Presentes reservados"
            value={stats.reservedGifts}
            hint={`de ${stats.totalGifts} disponíveis`}
            icon={<Gift className="h-4 w-4" />}
            accent="amber"
          />
          <StatCard
            index={2}
            label="Valor recebido"
            value={formatCurrencyBRL(stats.totalReceived)}
            icon={<Wallet className="h-4 w-4" />}
            accent="rose"
          />
          <StatCard
            index={3}
            label="Mensagens"
            value={stats.messagesCount}
            hint="dos convidados"
            icon={<MessageCircleHeart className="h-4 w-4" />}
            accent="stone"
          />
        </div>

        <SectionCard
          title="Financeiro"
          description="Recebido, despesas pagas e saldo atual"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard
              label="Recebido"
              value={formatCurrencyBRL(stats.totalReceived)}
              accent="emerald"
            />
            <StatCard
              label="Despesas pagas"
              value={formatCurrencyBRL(stats.totalExpensesPaid)}
              hint={`de ${formatCurrencyBRL(stats.totalExpenses)} previstos`}
              accent="rose"
            />
            <StatCard
              label="Saldo"
              value={formatCurrencyBRL(stats.netBalance)}
              accent={stats.netBalance >= 0 ? 'emerald' : 'rose'}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Reservas ao longo do tempo"
          description="Últimos 30 dias"
        >
          <ReservationsChart data={stats.timeline} />
        </SectionCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard
            title="Status dos presentes"
            description="Distribuição atual"
          >
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
          </SectionCard>

          <SectionCard
            title="Confirmações de presença"
            description="Distribuição por status"
          >
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
          </SectionCard>
        </div>

        <SectionCard
          title="Atividade recente"
          description="Últimas movimentações"
          action={
            <Link
              href="/admin/resumo"
              className="text-sm text-amber-700 hover:underline"
            >
              Ver tudo →
            </Link>
          }
        >
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-stone-400">
                  <th className="px-4 py-3 font-medium">Convidado</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 font-medium">Detalhes</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Quando</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {stats.recentActivity.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-stone-50/60"
                  >
                    <td className="px-4 py-3 font-medium text-stone-800">
                      {row.guestName}
                    </td>
                    <td className="px-4 py-3 text-stone-600">{row.type}</td>
                    <td className="px-4 py-3 text-stone-600">{row.detail}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3 text-stone-400">
                      {formatRelativeTime(row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </AdminPageTransition>
  )
}
