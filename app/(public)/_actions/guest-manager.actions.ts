'use server'

import {
  getGuestManagerContextController,
  touchGuestManagerLinkController,
  updateManagedGuestController,
} from '@/src/interface-adapters/controllers/guest-manager-links/guest-manager-access.controller'
import { revalidateGroup } from '@/src/lib/revalidate'

export async function getGuestManagerContextAction(token: string) {
  return getGuestManagerContextController(token)
}

export async function updateManagedGuestAction(input: unknown) {
  const res = await updateManagedGuestController(input)
  // The manager page renders dynamically, so only the admin views need busting.
  if (res.ok) revalidateGroup('guests')
  return res
}

/** Called from `after()`; failures are swallowed by handle() and never surfaced. */
export async function touchGuestManagerLinkAction(token: string) {
  return touchGuestManagerLinkController(token)
}
