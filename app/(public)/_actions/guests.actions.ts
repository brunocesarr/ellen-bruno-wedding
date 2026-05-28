'use server'

import { confirmAttendanceController } from '@/src/interface-adapters/controllers/guests/confirm-attendance.controller'
import { getInviteContextController } from '@/src/interface-adapters/controllers/guests/get-invite-context.controller'
import { revalidatePath } from 'next/cache'

export async function getInviteContextAction(token: string) {
  return getInviteContextController(token)
}

export async function confirmAttendanceAction(input: unknown) {
  const res = await confirmAttendanceController(input)
  if (res.ok) {
    revalidatePath('/invite/full', 'page')
    revalidatePath('/admin/convidados')
    revalidatePath('/admin/confirmacoes')
  }
  return res
}
