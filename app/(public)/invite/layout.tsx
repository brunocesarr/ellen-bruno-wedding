import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: '💌 Convite | Ellen & Bruno',
  description:
    'Você recebeu um convite especial para o casamento de Ellen & Bruno. Abra para ver!',
  openGraph: {
    title: '💌 Você recebeu um convite!',
    description: 'Ellen & Bruno convidam você para um dia especial.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#C17B5A',
}

export default function ConviteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
