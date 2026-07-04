'use server'

import { confirmAttendanceController } from '@/src/interface-adapters/controllers/guests/confirm-attendance.controller'
import { getInviteContextController } from '@/src/interface-adapters/controllers/guests/get-invite-context.controller'
import { revalidateGroup } from '@/src/lib/revalidate'

export async function getInviteContextAction(token: string) {
  return getInviteContextController(token)
}

export async function confirmAttendanceAction(input: unknown) {
  const res = await confirmAttendanceController(input)
  if (res.ok) revalidateGroup('invite')
  return res
}
