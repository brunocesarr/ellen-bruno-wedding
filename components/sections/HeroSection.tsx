import { getOrderedSiteImages } from '@/src/lib/get-site-image'
import { HeroContent } from './HeroContent'

const HERO_SLIDE_KEYS = [
  'hero-slide-1',
  'hero-slide-2',
  'hero-slide-3',
  'hero-slide-4',
  'hero-slide-5',
] as const

export async function HeroSection() {
  const slides = await getOrderedSiteImages(HERO_SLIDE_KEYS)

  return <HeroContent slides={slides} />
}
