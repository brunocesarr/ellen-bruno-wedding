import { resolveInviteAccessAction } from '@/app/(public)/_actions/invite-access.actions'
import { JourneyLibrary } from '@/components/journey/JourneyLibrary'
import { getOrderedSiteImages } from '@/src/lib/get-site-image'
import {
  JOURNEY_BOOKS,
  JOURNEY_IMAGE_KEYS,
  type ResolvedJourneyBook,
} from '@/src/lib/journey-catalog'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '📖 Nossa Jornada | Ellen & Bruno',
  description: 'Uma pequena biblioteca com a nossa história até aqui.',
  // The page is only reachable with a token; keep it out of search results.
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ token?: string }> }

export default async function NossaJornadaPage({ searchParams }: Props) {
  const { token } = await searchParams
  if (!token) redirect('/')

  // Accepts a personalised token, a party token, OR the generic shared link.
  // Guest tokens are resolved first, so personalised behaviour is unchanged.
  const access = await resolveInviteAccessAction(token)
  if (!access.ok) redirect('/')

  // Shared links have no guest, so there is no first name to greet.
  // Left undefined rather than faked: a generic greeting reads better than
  // "Olá, Convidado".
  const guestFirstName =
    access.data.kind === 'guest' ? access.data.guest.firstName : undefined

  // Resolve every referenced photo once (Supabase override → static fallback).
  const resolved = await getOrderedSiteImages(JOURNEY_IMAGE_KEYS)
  const byKey = new Map(resolved.map((img) => [img.key, img]))

  const books: ResolvedJourneyBook[] = JOURNEY_BOOKS.map((book) => ({
    ...book,
    pages: book.pages.map((page) => ({
      ...page,
      photos: (page.photos ?? []).map((photo) => {
        const img = byKey.get(photo.key)
        return {
          ...photo,
          src: img?.src ?? '',
          fallback: img?.fallback ?? '',
          alt: img?.alt ?? book.title,
        }
      }),
    })),
  }))

  return (
    <main className="min-h-screen-safe">
      <JourneyLibrary
        books={books}
        guestFirstName={guestFirstName}
        backHref={`/invite/full?token=${token}`}
      />
    </main>
  )
}
