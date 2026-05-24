import { Envelope } from '@/components/envelope/Envelope'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '💌 Convite | Ellen & Bruno',
  description:
    'Você recebeu um convite especial para o casamento de Ellen & Bruno.',
}

export default function ConvitePage() {
  return <Envelope />
}
