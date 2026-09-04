import { incrementGiftViewUseCase } from '@/src/application/use-cases/gifts/increment-gift-view.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function incrementGiftViewController(giftId: unknown) {
  return handle(async () => {
    const { giftsRepo } = await getContainer()
    return await incrementGiftViewUseCase({ giftsRepo })(giftId)
  })
}
