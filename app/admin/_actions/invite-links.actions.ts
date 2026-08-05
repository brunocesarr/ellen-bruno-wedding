'use server'

import { createInviteLinkController } from '@/src/interface-adapters/controllers/invite-links/create-invite-link.controller'
import { getActiveInviteLinkController } from '@/src/interface-adapters/controllers/invite-links/get-active-invite-link.controller'
import { revokeInviteLinksController } from '@/src/interface-adapters/controllers/invite-links/revoke-invite-links.controller'
import { revalidateGroup } from '@/src/lib/revalidate'

export async function getActiveInviteLinkAction() {
  return getActiveInviteLinkController()
}

export async function createInviteLinkAction(input: { label?: string } = {}) {
  const res = await createInviteLinkController(input)
  if (res.ok) revalidateGroup('inviteLinks')
  return res
}

export async function revokeInviteLinksAction() {
  const res = await revokeInviteLinksController()
  if (res.ok) revalidateGroup('inviteLinks')
  return res
}
