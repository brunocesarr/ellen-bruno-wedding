import { MotionWrapper } from '@/components/layout/MotionWrapper'
import { AboutSection } from '@/components/sections/AboutSection'
import { HeroSection } from '@/components/sections/HeroSection'
import dynamic from 'next/dynamic'

const MonogramSection = dynamic(() =>
  import('@/components/sections/MonogramSection').then(
    (mod) => mod.MonogramSection
  )
)

const CountdownSection = dynamic(() =>
  import('@/components/sections/CountdownSection').then(
    (mod) => mod.CountdownSection
  )
)

const TestimonialSection = dynamic(() =>
  import('@/components/sections/TestimonialSection').then(
    (mod) => mod.TestimonialSection
  )
)

const GallerySection = dynamic(() =>
  import('@/components/sections/GallerySection').then(
    (mod) => mod.GallerySection
  )
)

const GiftsTeaserSection = dynamic(() =>
  import('@/components/sections/GiftsTeaserSection').then(
    (mod) => mod.GiftsTeaserSection
  )
)

const FooterSection = dynamic(() =>
  import('@/components/sections/FooterSection').then((mod) => mod.default)
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
