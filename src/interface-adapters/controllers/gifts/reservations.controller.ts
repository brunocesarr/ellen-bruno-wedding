import { updateReservationStatusUseCase } from '@/src/application/use-cases/gifts/update-reservation-status.use-case'
import { getContainer } from '@/src/di/container'
import type { ReservationStatus } from '@/src/entities/models/dashboard'
import { handle } from '../_handle'

export async function updateReservationStatusController(
  giftId: string,
  status: ReservationStatus
) {
  const c = await getContainer()
  return handle(() => updateReservationStatusUseCase(c)(giftId, status))
}
