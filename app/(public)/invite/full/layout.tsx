import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Ellen & Bruno — Wedding Day | 2026',
  description:
    'Dear friends and family! We joyfully invite you to celebrate our wedding day with us.',
  openGraph: {
    title: 'Ellen & Bruno — Wedding Day',
    description: 'Join us to celebrate our love',
    type: 'website',
    locale: 'pt_BR',
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
