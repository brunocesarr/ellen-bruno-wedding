'use server'

import { createGuestController } from '@/src/interface-adapters/controllers/guests/create-guest.controller'
import { deleteGuestController } from '@/src/interface-adapters/controllers/guests/delete-guest.controller'
import { listGuestsController } from '@/src/interface-adapters/controllers/guests/list-guests.controller'
import { updateGuestController } from '@/src/interface-adapters/controllers/guests/update-guest.controller'
import { revalidatePath } from 'next/cache'

const ADMIN_GUESTS_PATHS = ['/admin', '/admin/convidados', '/admin/resumo']

function revalidateAdminGuestsPaths() {
  for (const path of ADMIN_GUESTS_PATHS) revalidatePath(path)
}

export async function listGuestsAction() {
  return listGuestsController()
}

export async function createGuestAction(input: unknown) {
  const res = await createGuestController(input)
  if (res.ok) revalidateAdminGuestsPaths()
  return res
}

export async function updateGuestAction(input: unknown) {
  const res = await updateGuestController(input)
  if (res.ok) revalidateAdminGuestsPaths()
  return res
}

export async function deleteGuestAction(id: string) {
  const res = await deleteGuestController(id)
  if (res.ok) revalidateAdminGuestsPaths()
  return res
}
