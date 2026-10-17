import type { MetadataRoute } from 'next'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ellen-bruno-wedding.netlify.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/presentes', '/nossa-jornada'].map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.6,
  }))
}
