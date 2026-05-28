import { Envelope } from '@/components/envelope/Envelope'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getInviteContextAction } from '../_actions/guests.actions'

export const metadata: Metadata = {
  title: '💌 Convite | Ellen & Bruno',
  description:
    'Você recebeu um convite especial para o casamento de Ellen & Bruno.',
}

type Props = { searchParams: Promise<{ token?: string }> }

export default async function ConvitePage({ searchParams }: Props) {
  const { token } = await searchParams
  if (!token) redirect('/')

  const res = await getInviteContextAction(token)
  if (!res.ok) redirect('/')

  return <Envelope token={token} />
}
