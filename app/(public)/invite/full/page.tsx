import {
  resolveInviteAccessAction,
  touchInviteLinkAction,
} from '@/app/(public)/_actions/invite-access.actions'
import { InvitationPageShell } from '@/components/invite/InvitationPageShell'
import { AboutSection } from '@/components/sections/AboutSection'
import { CountdownSection } from '@/components/sections/CountdownSection'
import { DressCodeSection } from '@/components/sections/DressCodeSection'
import FooterSection from '@/components/sections/FooterSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { GiftsTeaserSection } from '@/components/sections/GiftsTeaserSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { InvitationSection } from '@/components/sections/InvitationSection'
import { JourneyTeaserSection } from '@/components/sections/JourneyTeaserSection'
import { LocationSection } from '@/components/sections/LocationSection'
import { MonogramSection } from '@/components/sections/MonogramSection'
import { ParentsSection } from '@/components/sections/ParentsSection'
import { RsvpSection } from '@/components/sections/RsvpSection'
import { TestimonialSection } from '@/components/sections/TestimonialSection'
import { TimelineSection } from '@/components/sections/TimelineSection'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { after } from 'next/server'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Convite • Ellen & Bruno',
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{
    token?: string
  }>
}

export default async function FullInvitePage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    redirect('/')
  }

  // Accepts a personalised token, a party token, or the generic shared link.
  const access = await resolveInviteAccessAction(token)

  if (!access.ok) {
    redirect('/')
  }

  // Visit counter for the shared link, scheduled after the response so it never
  // adds latency and can never fail the page. Fires on cache miss only.
  if (access.data.kind === 'shared') {
    after(async () => {
      await touchInviteLinkAction(token)
    })
  }

  // Every section below is already guest-agnostic — the sections that take a
  // token only forward it into URLs — so the shared link renders the full
  // invitation with no personalisation and no PII.
  return (
    <InvitationPageShell>
      <HeroSection />
      <MonogramSection />
      <CountdownSection />
      <AboutSection />
      <TestimonialSection />
      <GallerySection />
      <JourneyTeaserSection token={token} />
      <ParentsSection />
      <InvitationSection />
      <LocationSection />
      <TimelineSection />
      <DressCodeSection />
      <GiftsTeaserSection token={token} />
      <RsvpSection token={token} />
      <FooterSection />
    </InvitationPageShell>
  )
}
