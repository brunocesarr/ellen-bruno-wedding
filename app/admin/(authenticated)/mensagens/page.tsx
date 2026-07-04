import { listMessagesAction } from '@/app/admin/_actions/messages.actions'
import { MessagesGrid } from '@/components/admin/MessagesGrid'
import { SectionCard } from '@/components/admin/SectionCard'
import { StatCard } from '@/components/admin/StatCard'
import { unwrapForPage } from '@/src/lib/server-action-result'
import { Gift, Heart, MessageCircleHeart } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MensagensPage() {
  const messages = unwrapForPage(await listMessagesAction())

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-stone-900 md:text-4xl">
          Mensagens dos Convidados
        </h1>
        <p className="mt-1 text-stone-500">
          Cada palavra que vocês receberam, em um só lugar 💛
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <StatCard
          label="Mensagens"
          value={messages.length}
          icon={<MessageCircleHeart className="h-4 w-4" />}
          accent="amber"
        />
        <StatCard
          label="Com presente"
          value={messages.filter((m) => m.gift).length}
          icon={<Gift className="h-4 w-4" />}
          accent="emerald"
        />
        <StatCard
          label="Carinho"
          value="∞"
          icon={<Heart className="h-4 w-4" />}
          accent="rose"
        />
      </div>

      <SectionCard title="Mensagens" description="Em ordem cronológica">
        <MessagesGrid messages={messages} />
      </SectionCard>
    </div>
  )
}
