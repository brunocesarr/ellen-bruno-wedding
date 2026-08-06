import { resolveInviteAccessAction } from '@/app/(public)/_actions/invite-access.actions'
import { Envelope } from '@/components/envelope/Envelope'
import { redirectInvalidInvite } from '@/src/lib/invite-redirect'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '💌 Convite | Ellen & Bruno',
  description:
    'Você recebeu um convite especial para o casamento de Ellen & Bruno.',
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ token?: string }> }

export default async function ConvitePage({ searchParams }: Props) {
  const { token } = await searchParams
  if (!token) redirectInvalidInvite()

  const access = await resolveInviteAccessAction(token)
  if (!access.ok) redirectInvalidInvite()

  return <Envelope token={token} />
}
