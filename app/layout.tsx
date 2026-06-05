import { RouteLoader } from '@/components/ui/RouteLoader'
import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import {
  Cormorant_Garamond,
  Montserrat,
  Pinyon_Script,
  Special_Elite,
} from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import './globals.css'

const pinyonScript = Pinyon_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
  preload: false, // decorative
})
const cormorant = Cormorant_Garamond({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  preload: true, // hero/LCP heading
})
const montserrat = Montserrat({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  preload: true, // base body font
})
const specialElite = Special_Elite({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-typewriter',
  display: 'swap',
  preload: false,
})

// Audio toggle is non-critical -> client-only & lazy

const MusicToggleButton = dynamic(() =>
  import('@/components/ui/MusicToggle').then((m) => m.MusicToggle)
)

export const metadata: Metadata = {
  metadataBase: new URL('https://ellen-bruno-wedding.netlify.app'),
  title: 'Ellen & Bruno — Wedding Day | 2026',
  description:
    'Dear friends and family! We joyfully invite you to celebrate our wedding day with us.',
  openGraph: {
    title: 'Ellen & Bruno — Wedding Day | 2026',
    description:
      'Dear friends and family! We joyfully invite you to celebrate our wedding day with us.',
    url: 'https://ellen-bruno-wedding.netlify.app',
    type: 'website',
    locale: 'pt_BR',
    images: ['/monogram-eb.png', '/api/invitation'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ellen & Bruno — Wedding Day | 2026',
    description:
      'Dear friends and family! We joyfully invite you to celebrate our wedding day with us.',
    images: ['/monogram-eb.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#C17B5A',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${pinyonScript.variable} ${cormorant.variable} ${montserrat.variable} ${specialElite.variable} relative`}
    >
      <body className="font-body antialiased relative bg-ivory">
        <NuqsAdapter>
          <RouteLoader />
          {children}
          <MusicToggleButton />
        </NuqsAdapter>
      </body>
    </html>
  )
}
