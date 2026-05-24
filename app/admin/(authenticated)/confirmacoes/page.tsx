import { listRsvpAction } from '@/app/admin/_actions/rsvp.actions'
import { ConfirmationsList } from '@/components/admin/ConfirmationsList'
import { SectionCard } from '@/components/admin/SectionCard'
import { StatCard } from '@/components/admin/StatCard'
import { HeartHandshake, UserCheck, UserX, Users } from 'lucide-react'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ConfirmacoesPage() {
  const result = await listRsvpAction()
  if (!result.ok) {
    if (result.error === 'unauthorized') redirect('/admin/login')
    throw new Error(result.error)
  }
  const confirmations = result.data
  const total = confirmations.reduce((s, c) => s + c.guestsCount, 0)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-stone-900 md:text-4xl">
          Confirmações de Presença
        </h1>
        <p className="mt-1 text-stone-500">
          Acompanhem quem já confirmou presença.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total de pessoas"
          value={total}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          label="Confirmados"
          value={confirmations.filter((c) => c.status === 'confirmed').length}
          icon={<UserCheck className="h-4 w-4" />}
          accent="emerald"
        />
        <StatCard
          label="Pendentes"
          value={confirmations.filter((c) => c.status === 'pending').length}
          icon={<HeartHandshake className="h-4 w-4" />}
          accent="amber"
        />
        <StatCard
          label="Recusados"
          value={confirmations.filter((c) => c.status === 'declined').length}
          icon={<UserX className="h-4 w-4" />}
          accent="rose"
        />
      </div>

      <SectionCard title="Lista de convidados">
        <ConfirmationsList items={confirmations} />
      </SectionCard>
    </div>
  )
}
