'use server'

import { assignGuestPartyController } from '@/src/interface-adapters/controllers/guests/assign-guest-party.controller'
import { createGuestController } from '@/src/interface-adapters/controllers/guests/create-guest.controller'
import { deleteGuestController } from '@/src/interface-adapters/controllers/guests/delete-guest.controller'
import { listGuestsController } from '@/src/interface-adapters/controllers/guests/list-guests.controller'
import { resetAllGuestsToPendingController } from '@/src/interface-adapters/controllers/guests/reset-all-guests-to-pending.controller'
import { updateGuestController } from '@/src/interface-adapters/controllers/guests/update-guest.controller'
import { revalidateGroup } from '@/src/lib/revalidate'

export async function listGuestsAction() {
  return listGuestsController()
}

export async function createGuestAction(input: unknown) {
  const res = await createGuestController(input)
  if (res.ok) revalidateGroup('guests')
  return res
}

export async function updateGuestAction(input: unknown) {
  const res = await updateGuestController(input)
  if (res.ok) revalidateGroup('guests')
  return res
}

export async function assignGuestPartyAction(input: unknown) {
  const res = await assignGuestPartyController(input)
  if (res.ok) revalidateGroup('guests')
  return res
}

export async function deleteGuestAction(id: string) {
  const res = await deleteGuestController(id)
  if (res.ok) revalidateGroup('guests')
  return res
}

export async function resetAllGuestsToPendingAction() {
  const res = await resetAllGuestsToPendingController()
  if (res.ok) revalidateGroup('guests')
  return res
}
