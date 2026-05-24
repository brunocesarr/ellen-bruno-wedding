import { DonutChart } from '@/components/admin/charts/DonutChart'
import { ReservationsChart } from '@/components/admin/charts/ReservationsChart'
import { SectionCard } from '@/components/admin/SectionCard'
import { StatCard } from '@/components/admin/StatCard'
import { formatCurrencyBRL } from '@/lib/format'
import { Download } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getDashboardStatsAction } from '../_actions/dashboard.actions'

export const dynamic = 'force-dynamic'

export default async function ResumoPage() {
  const result = await getDashboardStatsAction()
  if (!result.ok) {
    if (result.error === 'unauthorized') redirect('/admin/login')
    throw new Error(result.error)
  }
  const stats = result.data

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
    </div>
  )
}
