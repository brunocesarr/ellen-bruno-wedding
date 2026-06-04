import { getInviteContextAction } from '@/app/(public)/_actions/guests.actions'
import { InvitationPageShell } from '@/components/invite/InvitationPageShell'
import { AboutSection } from '@/components/sections/AboutSection'
import { CountdownSection } from '@/components/sections/CountdownSection'
import { DressCodeSection } from '@/components/sections/DressCodeSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { GiftsTeaserSection } from '@/components/sections/GiftsTeaserSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { InvitationSection } from '@/components/sections/InvitationSection'
import { LocationSection } from '@/components/sections/LocationSection'
import { MonogramSection } from '@/components/sections/MonogramSection'
import { ParentsSection } from '@/components/sections/ParentsSection'
import { RsvpSection } from '@/components/sections/RsvpSection'
import { TestimonialSection } from '@/components/sections/TestimonialSection'
import { TimelineSection } from '@/components/sections/TimelineSection'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Convite • Ellen & Bruno',
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ token?: string }> }

export default async function FullInvitePage({ searchParams }: Props) {
  const { token } = await searchParams
  if (!token) redirect('/')

  const res = await getInviteContextAction(token)
  if (!res.ok) redirect('/')

  return (
    <InvitationPageShell>
      <HeroSection />
      <MonogramSection />
      <CountdownSection />
      <AboutSection />
      <TestimonialSection />
      <GallerySection />
      <ParentsSection />
      <InvitationSection />
      <LocationSection />
      <TimelineSection />
      <DressCodeSection />
      <GiftsTeaserSection token={token} />
      <RsvpSection token={token} />
      {/* Footer */}
      <footer className="bg-cream px-6 py-8 text-center">
        <p className="font-script text-2xl text-terracotta">E.B</p>
        <p className="mt-2 font-body text-[0.65rem] uppercase tracking-[0.3em] text-warm-gray/70">
          com amor, 2026
        </p>
      </footer>
    </InvitationPageShell>
  )
}
