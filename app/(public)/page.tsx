import { MotionWrapper } from '@/components/layout/MotionWrapper'
import { AboutSection } from '@/components/sections/AboutSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { GiftsTeaserSection } from '@/components/sections/GiftsTeaserSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { TestimonialSection } from '@/components/sections/TestimonialSection'
import { InviteLink } from '@/components/ui/InviteLink'
import dynamic from 'next/dynamic'

// Corrected dynamic imports
const MonogramSection = dynamic(() =>
  import('@/components/sections/MonogramSection').then(
    (mod) => mod.MonogramSection // <-- Explicitly select the named export
  )
)

const CountdownSection = dynamic(() =>
  import('@/components/sections/CountdownSection').then(
    (mod) => mod.CountdownSection // <-- Do the same for this component
  )
)

export default function WeddingPage() {
  return (
    <MotionWrapper>
      <HeroSection />
      <MonogramSection />
      <CountdownSection />
      <AboutSection />
      <TestimonialSection />
      <GallerySection />
      <GiftsTeaserSection />
      {/* Footer */}
      <footer className="bg-cream px-6 py-8 text-center">
        <p className="font-script text-2xl text-terracotta">E.B</p>
        <p className="mt-2 font-body text-[0.65rem] uppercase tracking-[0.3em] text-warm-gray/50">
          com amor, 2026
        </p>
      </footer>
      <InviteLink />
    </MotionWrapper>
  )
}
