import { listGuestsAction } from '@/app/admin/_actions/guests.actions'
import { GuestsTable } from '@/components/admin/GuestsTable'
import { SectionCard } from '@/components/admin/SectionCard'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function GuestsPage() {
  const res = await listGuestsAction()
  if (!res.ok) {
    if (res.error === 'unauthorized') redirect('/admin/login')
    throw new Error(res.error)
  }

  return (
    <section className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-stone-800">Convidados</h1>
          <p className="text-sm text-stone-500">
            Gerencie a lista oficial e gere o link individual de cada convite.
          </p>
        </div>
      </header>

      <SectionCard
        title="Lista de convidados"
        description="Convidados são organizados em grupos para que cada convite confirme seus acompanhantes."
      >
        <GuestsTable guests={res.data} />
      </SectionCard>
    </section>
  )
}
