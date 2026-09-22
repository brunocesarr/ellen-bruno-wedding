import { listGuestManagerLinksAction } from '@/app/admin/_actions/guest-manager-links.actions'
import { listGuestsAction } from '@/app/admin/_actions/guests.actions'
import { GuestManagerLinksCard } from '@/components/admin/GuestManagerLinksCard'
import { GuestsTable } from '@/components/admin/GuestsTable'
import { SectionCard } from '@/components/admin/SectionCard'
import { unwrapForPage } from '@/src/lib/server-action-result'

export const dynamic = 'force-dynamic'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ellen-bruno-wedding.netlify.app'

export default async function GuestsPage() {
  const [guests, managerLinks] = await Promise.all([
    listGuestsAction().then(unwrapForPage),
    listGuestManagerLinksAction().then(unwrapForPage),
  ])

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

      <GuestManagerLinksCard links={managerLinks} siteUrl={SITE_URL} />

      <SectionCard
        title="Lista de convidados"
        description="Convidados são organizados em grupos para que cada convite confirme seus acompanhantes."
      >
        <GuestsTable guests={guests} />
      </SectionCard>
    </section>
  )
}
