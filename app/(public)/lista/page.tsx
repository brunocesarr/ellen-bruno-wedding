import {
  getGuestManagerContextAction,
  touchGuestManagerLinkAction,
} from '@/app/(public)/_actions/guest-manager.actions'
import { GuestManagerAccessDenied } from '@/components/guest-manager/GuestManagerAccessDenied'
import { GuestManagerBoard } from '@/components/guest-manager/GuestManagerBoard'
import type { Metadata } from 'next'
import { after } from 'next/server'

/**
 * Per-token, carries guest PII and is edited live: never cached, and never
 * given a `revalidate` window — a shared cache entry here would serve one
 * manager's list to whoever asked next.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Lista de convidados • Ellen & Bruno',
  robots: { index: false, follow: false },
}

type Props = { searchParams: Promise<{ token?: string }> }

export default async function GuestListManagerPage({ searchParams }: Props) {
  const { token } = await searchParams
  if (!token) return <GuestManagerAccessDenied />

  const context = await getGuestManagerContextAction(token)
  if (!context.ok) return <GuestManagerAccessDenied />

  // Usage counter: deferred, never awaited in render.
  after(async () => {
    await touchGuestManagerLinkAction(token)
  })

  return (
    <GuestManagerBoard
      token={token}
      label={context.data.label}
      expiresAt={context.data.expiresAt}
      guests={context.data.guests}
    />
  )
}
