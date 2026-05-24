'use server'

import type { ReservationStatus } from '@/src/entities/models/dashboard'
import { updateReservationStatusController } from '@/src/interface-adapters/controllers/gifts/reservations.controller'
import { revalidatePath } from 'next/cache'

export async function updateReservationStatusAction(
  giftId: string,
  status: ReservationStatus
) {
  const result = await updateReservationStatusController(giftId, status)
  if (result.ok) {
    revalidatePath('/admin')
    revalidatePath('/admin/presentes')
    revalidatePath('/admin/mensagens')
    revalidatePath('/admin/resumo')
  }
  return result
}
