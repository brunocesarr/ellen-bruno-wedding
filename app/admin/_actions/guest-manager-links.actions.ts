'use server'

import {
  createGuestManagerLinkController,
  listGuestManagerLinksController,
  revokeAllGuestManagerLinksController,
  revokeGuestManagerLinkController,
} from '@/src/interface-adapters/controllers/guest-manager-links/manage-guest-manager-links.controller'
import { revalidateGroup } from '@/src/lib/revalidate'

export async function listGuestManagerLinksAction() {
  return listGuestManagerLinksController()
}

export async function createGuestManagerLinkAction(
  input: { label?: string; expiresInDays?: number } = {}
) {
  const res = await createGuestManagerLinkController(input)
  if (res.ok) revalidateGroup('guestManagerLinks')
  return res
}

export async function revokeGuestManagerLinkAction(id: string) {
  const res = await revokeGuestManagerLinkController({ id })
  if (res.ok) revalidateGroup('guestManagerLinks')
  return res
}

export async function revokeAllGuestManagerLinksAction() {
  const res = await revokeAllGuestManagerLinksController()
  if (res.ok) revalidateGroup('guestManagerLinks')
  return res
}
