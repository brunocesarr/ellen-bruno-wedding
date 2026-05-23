import { getContainer } from '@/src/di/container'

export default async function AdminDashboard() {
  const { rsvpRepo, giftsRepo } = await getContainer()
  const [rsvps, gifts] = await Promise.all([rsvpRepo.list(), giftsRepo.list()])
  const attending = rsvps.filter((r) => r.attending)
  const totalGuests = attending.reduce((sum, r) => sum + 1 + r.companions, 0)
  const reserved = gifts.filter((g) => g.isReserved).length

  return (
    <main className="mx-auto max-w-4xl space-y-6">
      <h1 className="font-serif text-3xl">Visão geral</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card title="Convidados confirmados" value={totalGuests} />
        <Card title="Total de RSVPs" value={rsvps.length} />
        <Card
          title="Presentes reservados"
          value={`${reserved} / ${gifts.length}`}
        />
      </div>
    </main>
  )
}
function Card({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  )
}
