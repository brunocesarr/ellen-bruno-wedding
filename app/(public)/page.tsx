import { MotionWrapper } from '@/components/layout/MotionWrapper'
import { WeddingFooter } from '@/components/layout/WeddingFooter'
import { GallerySection } from '@/components/sections/GallerySection'
import { HeroSection } from '@/components/sections/HeroSection'
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
      <GallerySection />
      <WeddingFooter />
      <InviteLink />
    </MotionWrapper>
  )
}
