import { getSiteImage } from '@/src/lib/get-site-image'
import { MonogramContent } from './MonogramContent'

export async function MonogramSection() {
  const monogram = await getSiteImage('monogram-eb')
  return <MonogramContent monogram={monogram} />
}
