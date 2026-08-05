import { getActiveInviteLinkAction } from '@/app/admin/_actions/invite-links.actions'
import { listRsvpRequestsAction } from '@/app/admin/_actions/rsvp-requests.actions'
import { RsvpRequestsTable } from '@/components/admin/RsvpRequestsTable'
import { SectionCard } from '@/components/admin/SectionCard'
import { ShareableInviteLinkCard } from '@/components/admin/ShareableInviteLinkCard'
import { StatCard } from '@/components/admin/StatCard'
import { unwrapForPage } from '@/src/lib/server-action-result'
import { CheckCircle2, Clock, MailWarning, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ellen-bruno-wedding.netlify.app'

export default async function SolicitacoesPage() {
  const [requests, activeLink] = await Promise.all([
    listRsvpRequestsAction().then(unwrapForPage),
    getActiveInviteLinkAction().then(unwrapForPage),
  ])

  const pending = requests.filter((r) => r.status === 'pending')
  const approved = requests.filter((r) => r.status === 'approved')
  const rejected = requests.filter((r) => r.status === 'rejected')
  const unnotified = requests.filter(
    (r) => r.status !== 'pending' && r.notifiedAt === null
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-stone-900 md:text-4xl">
          Solicitações de Convite
        </h1>
        <p className="mt-1 text-stone-500">
          Pessoas que se cadastraram sem convite personalizado
        </p>
      </header>

      <ShareableInviteLinkCard link={activeLink} siteUrl={SITE_URL} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Aguardando"
          value={pending.length}
          icon={<Clock className="h-4 w-4" />}
          accent="amber"
        />
        <StatCard
          label="Avisos pendentes"
          value={unnotified.length}
          hint={unnotified.length > 0 ? 'Reenvie o aviso' : undefined}
          icon={<MailWarning className="h-4 w-4" />}
          accent="rose"
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
      </div>

      {unnotified.length > 0 && (
        <SectionCard
          title="Avisos não entregues"
          description="A decisão foi salva, mas estas pessoas ainda não foram avisadas"
        >
          <RsvpRequestsTable requests={unnotified} />
        </SectionCard>
      )}

      {pending.length > 0 && (
        <SectionCard
          title="Aguardando resposta"
          description="Aprovar adiciona a pessoa à lista de convidados e dispara um aviso"
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
