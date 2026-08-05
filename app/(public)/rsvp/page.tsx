import { resolveInviteAccessAction } from '@/app/(public)/_actions/invite-access.actions'
import { HomeButton } from '@/components/public/HomeButton'
import { RsvpForm } from '@/components/rsvp/RsvpForm'
import { RsvpRequestForm } from '@/components/rsvp/RsvpRequestForm'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Confirme sua presença · Ellen & Bruno',
  description: 'Confirme sua presença no nosso casamento.',
}

type Props = { searchParams: Promise<{ token?: string }> }

/** Shared by the no-token and shared-link paths — identical experience. */
function RequestFlow({ backHref }: { backHref: string }) {
  return (
    <main className="relative overflow-hidden bg-cream">
      <HomeButton href={backHref} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-linear-to-b from-cream-dark to-transparent"
      />

      <section className="mx-auto min-h-screen max-w-5xl px-6 py-24 md:py-32">
        <SectionHeading
          title="Sua presença"
          eyebrow="Solicitação de convite"
          accent="Conte-nos quem você é"
        />
        <RsvpRequestForm />
      </section>
    </main>
  )
}

export default async function RsvpPage({ searchParams }: Props) {
  const { token } = await searchParams

  // --- No token: open request flow -----------------------------------------
  if (!token) {
    return <RequestFlow backHref="/" />
  }

  const access = await resolveInviteAccessAction(token)
  if (!access.ok) redirect('/')

  // --- Shared link: same request flow, but keep the invitation reachable ---
  if (access.data.kind === 'shared') {
    return <RequestFlow backHref={`/invite/full?token=${token}`} />
  }

  // --- Personalised / party token: existing behaviour, unchanged -----------
  const { guest, partyMembers } = access.data

  return (
    <main className="relative overflow-hidden bg-cream">
      <HomeButton href={'/invite/full?token=' + token} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-linear-to-b from-cream-dark to-transparent"
      />

      <section className="mx-auto min-h-screen max-w-5xl px-6 py-24 md:py-32">
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
