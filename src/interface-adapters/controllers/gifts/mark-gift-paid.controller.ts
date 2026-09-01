import { markGiftPaidManuallyUseCase } from '@/src/application/use-cases/gifts/mark-gift-paid.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '../_handle'

export async function markGiftPaidManuallyController(input: unknown) {
  const c = await getContainer()
  return handle(() => markGiftPaidManuallyUseCase(c)(input))
}
