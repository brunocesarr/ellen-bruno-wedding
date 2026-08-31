import { RouteLoader } from '@/components/ui/RouteLoader'
import { getMusicTracks } from '@/src/lib/get-music-tracks'
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
  preload: false,
})
const cormorant = Cormorant_Garamond({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
})
const montserrat = Montserrat({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  preload: true,
})
const specialElite = Special_Elite({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-typewriter',
  display: 'swap',
  preload: false,
})

const MusicToggleButton = dynamic(() =>
  import('@/components/ui/MusicToggle').then((m) => m.MusicToggle)
)

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      'https://ellen-bruno-wedding.netlify.app'
  ),
  title: 'Ellen & Bruno — Wedding Day | 2026',
  description:
    'Queridos amigos e familiares! Convidamos vocês, com alegria, para celebrar o dia do nosso casamento conosco.',
  openGraph: {
    title: 'Ellen & Bruno — Wedding Day | 2026',
    description:
      'Queridos amigos e familiares! Convidamos vocês, com alegria, para celebrar o dia do nosso casamento conosco.',
    url: '/',
    type: 'website',
    locale: 'pt_BR',
    images: ['/monogram-eb.png', '/api/invitation'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ellen & Bruno — Wedding Day | 2026',
    description:
      'Queridos amigos e familiares! Convidamos vocês, com alegria, para celebrar o dia do nosso casamento conosco.',
    images: ['/monogram-eb.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#C17B5A',
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tracks = await getMusicTracks()

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${pinyonScript.variable} ${cormorant.variable} ${montserrat.variable} ${specialElite.variable} relative`}
    >
      <body
        className="font-body antialiased relative bg-ivory"
        cz-shortcut-listen="true"
      >
        <NuqsAdapter>
          <RouteLoader />
          {children}
          <MusicToggleButton tracks={tracks} />
        </NuqsAdapter>
      </body>
    </html>
  )
}
