import { confirmAttendanceUseCase } from '@/src/application/use-cases/guests/confirm-attendance.use-case'
import { getPublicContainer } from '@/src/di/public-container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function confirmAttendanceController(input: unknown) {
  return handle(async () => {
    const c = getPublicContainer()
    return await confirmAttendanceUseCase({ guestsRepo: c.guestsRepo })(input)
  })
}
