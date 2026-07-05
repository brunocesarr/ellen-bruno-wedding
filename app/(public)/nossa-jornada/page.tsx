import { JourneyLibrary } from '@/components/journey/JourneyLibrary'
import { getOrderedSiteImages } from '@/src/lib/get-site-image'
import {
  JOURNEY_BOOKS,
  JOURNEY_IMAGE_KEYS,
  type ResolvedJourneyBook,
} from '@/src/lib/journey-catalog'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getInviteContextAction } from '../_actions/guests.actions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '📖 Nossa Jornada | Ellen & Bruno',
  description: 'Uma pequena biblioteca com a nossa história até aqui.',
}

type Props = { searchParams: Promise<{ token?: string }> }

export default async function NossaJornadaPage({ searchParams }: Props) {
  const { token } = await searchParams
  if (!token) redirect('/')

  // Same token gate as /invite — validates individual OR party invite tokens.
  const res = await getInviteContextAction(token)
  if (!res.ok) redirect('/')

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
      <JourneyLibrary books={books} guestFirstName={res.data.guest.firstName} />
    </main>
  )
}
