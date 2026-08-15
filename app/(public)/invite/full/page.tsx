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
import { redirectInvalidInvite } from '@/src/lib/invite-redirect'
import type { Metadata } from 'next'
import { after } from 'next/server'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Convite • Ellen & Bruno',
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ token?: string }> }

export default async function FullInvitePage({ searchParams }: Props) {
  const { token } = await searchParams
  if (!token) redirectInvalidInvite()

  const access = await resolveInviteAccessAction(token)
  if (!access.ok) redirectInvalidInvite()

  if (access.data.kind === 'shared') {
    after(async () => {
      await touchInviteLinkAction(token)
    })
  }

  return (
    <InvitationPageShell>
      <HeroSection />
      <MonogramSection />
      <CountdownSection />
      <InvitationSection />
      <TestimonialSection />
      <ParentsSection />
      <LocationSection />
      <TimelineSection />
      <RsvpSection token={token} />
      <DressCodeSection />
      <GiftsTeaserSection token={token} />
      <AboutSection />
      <JourneyTeaserSection token={token} />
      <GallerySection />
      <FooterSection />
    </InvitationPageShell>
  )
}
