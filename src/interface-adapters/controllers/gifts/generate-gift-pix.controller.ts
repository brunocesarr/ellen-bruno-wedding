import { generateGiftPixUseCase } from '@/src/application/use-cases/gifts/generate-gift-pix.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '../_handle'

export async function generateGiftPixController(input: unknown) {
  const { giftsRepo, pixService } = await getContainer()
  return handle(() => generateGiftPixUseCase({ giftsRepo, pixService })(input))
}
