import { getSiteImage } from '@/src/lib/get-site-image'
import { LocationContent } from './LocationContent'

export async function LocationSection() {
  const venue = await getSiteImage('venue')
  return <LocationContent venue={venue} />
}
