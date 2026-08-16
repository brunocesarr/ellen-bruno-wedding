import { listGiftsAction } from '@/app/admin/_actions/gifts.actions'
import { GiftFormDialog } from '@/components/admin/GiftFormDialog'
import { GiftsTable } from '@/components/admin/GiftsTable'
import { SectionCard } from '@/components/admin/SectionCard'
import { StatCard } from '@/components/admin/StatCard'
import { buttonPrimary } from '@/src/lib/class-names'
import { unwrapForPage } from '@/src/lib/server-action-result'
import { cn } from '@/src/lib/utils'
import { Gift, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PresentesPage() {
  const gifts = unwrapForPage(await listGiftsAction())

  // Funds contribute their goal (when set) to the target and their actual
  // confirmed money to the received figure. Exclusive items keep the previous
  // price-based behaviour.
  const totalValue = gifts.reduce(
    (s, g) => s + (g.kind === 'fund' ? (g.goalAmount ?? 0) : (g.price ?? 0)),
    0
  )

  const reservedValue = gifts.reduce(
    (s, g) =>
      g.kind === 'fund'
        ? s + g.confirmedTotal
        : s + (g.status !== 'pending' ? (g.price ?? 0) : 0),
    0
  )

  // Funds never lock, so they are never counted as "reserved".
  const reservedCount = gifts.filter(
    (g) => g.kind !== 'fund' && g.status !== 'pending'
  ).length

  const fundsCount = gifts.filter((g) => g.kind === 'fund').length

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
            <button className={cn(buttonPrimary, 'py-2.5')}>
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
        <StatCard label="Reservados" value={reservedCount} accent="emerald" />
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
        description={
          fundsCount > 0
            ? `${gifts.length} itens cadastrados · ${fundsCount} vaquinha(s)`
            : `${gifts.length} itens cadastrados`
        }
      >
        <GiftsTable gifts={gifts} />
      </SectionCard>
    </div>
  )
}
