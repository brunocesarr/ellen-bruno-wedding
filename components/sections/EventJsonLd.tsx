import { WEDDING_DETAILS } from '@/src/lib/constants'

/**
 * schema.org Event data so search engines can show the date/venue as a rich
 * result. Built from WEDDING_DETAILS so it can never drift from the page.
 */
export function EventJsonLd() {
  const { couple, date, time, location } = WEDDING_DETAILS
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `Casamento de ${couple.bride} & ${couple.groom}`,
    startDate: `${date}T${time}:00-03:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: location.venue,
      address: {
        '@type': 'PostalAddress',
        streetAddress: location.address,
        addressLocality: location.city,
        addressCountry: 'BR',
      },
    },
  }

  return (
    <script
      type="application/ld+json"
      // "<" escaped so venue text can never close the script tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}
