import { getSiteImage } from '@/src/lib/get-site-image'
import { HeroContent } from './HeroContent'

export async function HeroSection() {
  const background = await getSiteImage('hero-bg')
  return <HeroContent background={background} />
}
