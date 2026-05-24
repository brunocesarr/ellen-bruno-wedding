import { GiftCardSkeleton } from '@/components/gifts/GiftCardSkeleton'
import { GiftFilterBar } from '@/components/gifts/GiftFilterBar'
import { GiftHero } from '@/components/gifts/GiftHero'
import { HowItWorks } from '@/components/gifts/HowItWorks'
import { EmptyState } from '@/components/ui/EmptyState'
import { listGiftsAdminController } from '@/src/interface-adapters/controllers/gifts/list-gifts.controller'
import { HeartHandshake } from 'lucide-react'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Lista de presentes · Ellen & Bruno',
  description:
    'Escolha um presente da nossa lista e contribua com a nova vida do casal pelo Pix.',
}

export default async function GiftsPage() {
  return (
    <main className="bg-cream">
      {/* Hero with polaroid montage */}
      <GiftHero
        couplePhoto="/images/couple-main.jpg"
        emotionPhoto="/images/couple-emotion.jpg"
        foreverPhoto="/images/couple-forever.jpg"
      />

      {/* Filterable grid */}
      <Suspense fallback={<GridSkeleton />}>
        <GiftListSection />
      </Suspense>

      {/* How it works */}
      <HowItWorks />

      {/* Closing message */}
      <section className="mx-auto max-w-2xl px-6 pb-24 text-center">
        <p className="accent">Com todo nosso amor 💕</p>
        <p className="mt-4 text-ink-muted">
          Obrigado por fazer parte deste momento tão especial das nossas vidas.
        </p>
      </section>
    </main>
  )
}

async function GiftListSection() {
  const gifts = await listGiftsAdminController()
  if (!gifts.ok)
    return (
      <EmptyState
        icon={<HeartHandshake className="w-12 h-12" />}
        title="Sem presentes cadastrados"
        description="Os presentes aparecerão aqui assim que forem adicionados."
      />
    )
  return <GiftFilterBar gifts={gifts.data} />
}

function GridSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <li key={i}>
            <GiftCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  )
}
