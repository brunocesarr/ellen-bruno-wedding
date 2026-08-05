import { listRsvpRequestsAction } from '@/app/admin/_actions/rsvp-requests.actions'
import { RsvpRequestsTable } from '@/components/admin/RsvpRequestsTable'
import { SectionCard } from '@/components/admin/SectionCard'
import { StatCard } from '@/components/admin/StatCard'
import { unwrapForPage } from '@/src/lib/server-action-result'
import { CheckCircle2, Clock, Inbox, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SolicitacoesPage() {
  const requests = unwrapForPage(await listRsvpRequestsAction())

  const pending = requests.filter((r) => r.status === 'pending')
  const approved = requests.filter((r) => r.status === 'approved')
  const rejected = requests.filter((r) => r.status === 'rejected')

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-stone-900 md:text-4xl">
          Solicitações de Convite
        </h1>
        <p className="mt-1 text-stone-500">
          Pessoas que se cadastraram sem convite personalizado 💌
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Aguardando"
          value={pending.length}
          icon={<Clock className="h-4 w-4" />}
          accent="amber"
        />
        <StatCard
          label="Aprovadas"
          value={approved.length}
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent="emerald"
        />
        <StatCard
          label="Recusadas"
          value={rejected.length}
          icon={<XCircle className="h-4 w-4" />}
          accent="stone"
        />
        <StatCard
          label="Total"
          value={requests.length}
          icon={<Inbox className="h-4 w-4" />}
          accent="rose"
        />
      </div>

      {pending.length > 0 && (
        <SectionCard
          title="Aguardando resposta"
          description="Aprovar adiciona a pessoa à lista de convidados e dispara um e-mail"
        >
          <RsvpRequestsTable requests={pending} />
        </SectionCard>
      )}

      <SectionCard
        title="Histórico"
        description="Todas as solicitações, em ordem cronológica"
      >
        <RsvpRequestsTable
          requests={requests.filter((r) => r.status !== 'pending')}
        />
      </SectionCard>
    </div>
  )
}
