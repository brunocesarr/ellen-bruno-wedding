import { GiftCardSkeleton } from '@/components/gifts/GiftCardSkeleton'
import { GiftFilterBar } from '@/components/gifts/GiftFilterBar'
import { GiftHero } from '@/components/gifts/GiftHero'
import { HowItWorks } from '@/components/gifts/HowItWorks'
import { HomeButton } from '@/components/public/HomeButton'
import { listGiftsController } from '@/src/interface-adapters/controllers/gifts/list-gifts.controller'
import { getOrderedSiteImages } from '@/src/lib/get-site-image'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const revalidate = 60
export const metadata: Metadata = {
  title: 'Lista de presentes · Ellen & Bruno',
  description:
    'Escolha um presente da nossa lista e contribua com a nova vida do casal pelo Pix.',
}
export const dynamic = 'force-dynamic'

type Props = { searchParams: Promise<{ token?: string }> }

const POLAROIDS_KEYS = [
  'couple-main',
  'couple-emotion',
  'couple-forever',
] as const

export default async function GiftsPage({ searchParams }: Props) {
  const { token } = await searchParams
  const photos = await getOrderedSiteImages(POLAROIDS_KEYS)

  return (
    <main className="bg-cream">
      <HomeButton
        href={token ? '/invite/full?token=' + token : '/invite/full'}
      />

      {photos.length >= 3 && photos[0] && photos[1] && photos[2] && (
        /* Hero with polaroid montage */
        <GiftHero
          couplePhoto={photos[0]?.src ?? photos[0]?.fallback}
          emotionPhoto={photos[1]?.src ?? photos[1]?.fallback}
          foreverPhoto={photos[2]?.src ?? photos[2]?.fallback}
        />
      )}

      {/* Filterable grid */}
      <Suspense fallback={<GridSkeleton />}>
        <GiftListSection token={token} />
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

async function GiftListSection({ token }: { token?: string }) {
  const gifts = await listGiftsController()
  if (!gifts.ok) return <GiftFilterBar gifts={[]} token={token} />
  return <GiftFilterBar gifts={gifts.data ?? []} token={token} />
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
