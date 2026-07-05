import { HomeButton } from '@/components/public/HomeButton'
import { RsvpForm } from '@/components/rsvp/RsvpForm'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getInviteContextAction } from '../_actions/guests.actions'

export const metadata: Metadata = {
  title: 'Confirme sua presença · Ellen & Bruno',
  description: 'Confirme sua presença no nosso casamento.',
}

type Props = { searchParams: Promise<{ token?: string }> }

export default async function RsvpPage({ searchParams }: Props) {
  const { token } = await searchParams
  if (!token) redirect('/')

  const res = await getInviteContextAction(token)
  if (!res.ok) redirect('/')

  const { guest, partyMembers } = res.data

  return (
    <main className="relative overflow-hidden bg-cream">
      <HomeButton href={'/invite/full?token=' + token} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-linear-to-b from-cream-dark to-transparent"
      />

      <section className="mx-auto max-w-5xl px-6 py-24 md:py-32 min-h-screen">
        <SectionHeading
          title="Sua presença"
          eyebrow="Confirmação de presença"
          accent="Pedimos o carinho de uma resposta"
        />
        <RsvpForm invite={{ guest, partyMembers }} />
      </section>
    </main>
  )
}
