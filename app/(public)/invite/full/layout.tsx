import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Ellen & Bruno — Wedding Day | 2026',
  description:
    'Queridos amigos e familiares! Convidamos vocês para celebrar nosso dia especial com a gente.',
  openGraph: {
    title: 'Ellen & Bruno — Wedding Day',
    description: 'Venha celebrar nosso amor',
    type: 'website',
    locale: 'pt_BR',
    images: [
      {
        url: '/monogram-eb.png',
        width: 1200,
        height: 630,
        alt: 'Ellen & Bruno',
      },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#F8F4EE',
}

export default function ConviteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
