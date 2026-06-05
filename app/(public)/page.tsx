import { MotionWrapper } from '@/components/layout/MotionWrapper'
import { AboutSection } from '@/components/sections/AboutSection'
import FooterSection from '@/components/sections/FooterSection'
import { GallerySection } from '@/components/sections/GallerySection'
import { GiftsTeaserSection } from '@/components/sections/GiftsTeaserSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { TestimonialSection } from '@/components/sections/TestimonialSection'
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

export const revalidate = 60

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
      <FooterSection />
    </MotionWrapper>
  )
}
