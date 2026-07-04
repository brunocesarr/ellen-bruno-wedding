import { reserveGiftUseCase } from '@/src/application/use-cases/gifts/reserve-gift.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '../_handle'

export async function reserveGiftController(input: unknown) {
  const { giftsRepo } = await getContainer()
  return handle(async () => {
    const gift = await reserveGiftUseCase({ giftsRepo })(input)
    return { id: gift.id, name: gift.name }
  })
}
