import { MusicToggle } from '@/components/ui/MusicToggle'
import { RouteLoader } from '@/components/ui/RouteLoader'
import type { Metadata, Viewport } from 'next'
import {
  Cormorant_Garamond,
  Inter,
  Montserrat,
  Pinyon_Script,
  Special_Elite,
} from 'next/font/google'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import './globals.css'

const pinyonScript = Pinyon_Script({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  variable: '--font-script',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const specialElite = Special_Elite({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-typewriter',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  // metadataBase is crucial for generating absolute URLs for OG images
  metadataBase: new URL('https://ellen-bruno-wedding.netlify.app'), // Replace with your actual domain
  title: 'Ellen & Bruno — Wedding Day | 2026',
  description:
    'Dear friends and family! We joyfully invite you to celebrate our wedding day with us.',
  openGraph: {
    title: 'Ellen &amp; Bruno — Wedding Day',
    description: 'Join us to celebrate our love',
    url: 'https://ellen-bruno-wedding.netlify.app', // Add the canonical URL
    type: 'website',
    locale: 'pt_BR',
    images: [
      {
        url: '/monogram-eb.png', // Place your OG image in the /public folder
        width: 1200,
        height: 630,
        alt: 'Ellen &amp; Bruno Wedding Invitation',
      },
      { url: '/api/invitation', width: 1200, height: 630 },
    ],
  },
  // Optional but recommended for Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Ellen &amp; Bruno — Wedding Day',
    description: 'Join us to celebrate our love',
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
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${pinyonScript.variable} ${cormorant.variable} ${montserrat.variable} ${specialElite.variable} ${inter.variable} relative`}
      data-lt-installed="true"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        className="font-body antialiased relative bg-ivory"
        cz-shortcut-listen="true"
      >
        <NuqsAdapter>
          <RouteLoader />
          {children}
          <MusicToggle />
        </NuqsAdapter>
      </body>
    </html>
  )
}
