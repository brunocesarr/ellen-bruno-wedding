import { GiftFormDialog } from '@/components/admin/GiftFormDialog'
import { GiftsTable } from '@/components/admin/GiftsTable'
import { SectionCard } from '@/components/admin/SectionCard'
import { StatCard } from '@/components/admin/StatCard'
import { Gift, Plus } from 'lucide-react'
import { redirect } from 'next/navigation'
import { listGiftsAdminAction } from '../_actions/gifts.actions'

export const dynamic = 'force-dynamic'

export default async function PresentesPage() {
  const result = await listGiftsAdminAction()
  if (!result.ok) {
    if (result.error === 'unauthorized') redirect('/admin/login')
    throw new Error(result.error)
  }
  const gifts = result.data
  const totalValue = gifts.reduce((s, g) => s + (g.price ?? 0), 0)
  const reservedValue = gifts
    .filter((g) => g.status !== 'pending')
    .reduce((s, g) => s + (g.price ?? 0), 0)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-stone-900 md:text-4xl">
            Lista de Presentes
          </h1>
          <p className="mt-1 text-stone-500">
            Gerenciem os itens que aparecem na lista do site.
          </p>
        </div>
        <GiftFormDialog
          trigger={
            <button className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600">
              <Plus className="h-4 w-4" /> Novo presente
            </button>
          }
        />
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Total"
          value={gifts.length}
          icon={<Gift className="h-4 w-4" />}
        />
        <StatCard
          label="Reservados"
          value={gifts.filter((g) => g.status !== 'pending').length}
          accent="emerald"
        />
        <StatCard
          label="Valor total"
          value={`R$ ${totalValue.toLocaleString('pt-BR')}`}
          accent="stone"
        />
        <StatCard
          label="Valor recebido"
          value={`R$ ${reservedValue.toLocaleString('pt-BR')}`}
          accent="rose"
        />
      </div>

      <SectionCard
        title="Todos os presentes"
        description={`${gifts.length} itens cadastrados`}
      >
        <GiftsTable gifts={gifts} />
      </SectionCard>
    </div>
  )
}
