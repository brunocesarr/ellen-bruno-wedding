import { MotionWrapper } from '@/components/layout/MotionWrapper'
import { WeddingFooter } from '@/components/layout/WeddingFooter'
import { PhotoGallery } from '@/components/photo-gallery/PhotoGallery'
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

const PHOTOS = [
  {
    src: '/images/gallery/1.jpg',
    alt: 'Primeiro encontro',
    caption: 'o início',
  },
  { src: '/images/gallery/2.jpg', alt: 'Pedido de casamento', caption: 'sim!' },
  { src: '/images/gallery/3.jpg', alt: 'Ensaio fotográfico', caption: 'amor' },
  { src: '/images/gallery/4.jpg', alt: 'Viagem juntos', caption: 'aventura' },
  { src: '/images/gallery/5.jpg', alt: 'Família', caption: 'lar' },
  { src: '/images/gallery/6.jpg', alt: 'Sorrisos', caption: 'felizes' },
  { src: '/images/gallery/7.jpg', alt: 'Para sempre', caption: 'sempre' },
]

export default function WeddingPage() {
  return (
    <MotionWrapper>
      <HeroSection />
      <MonogramSection />
      <CountdownSection />
      <PhotoGallery photos={PHOTOS} />
      <WeddingFooter />
      <InviteLink />
    </MotionWrapper>
  )
}
