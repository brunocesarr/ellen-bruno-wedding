import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ellen-bruno-wedding.netlify.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Token pages carry per-guest data; they are also noindex.
      disallow: ['/admin', '/api', '/invite', '/lista', '/rsvp'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
