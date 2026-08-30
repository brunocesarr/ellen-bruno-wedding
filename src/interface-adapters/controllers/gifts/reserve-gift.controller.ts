import { reserveGiftUseCase } from '@/src/application/use-cases/gifts/reserve-gift.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '../_handle'

export async function reserveGiftController(input: unknown) {
  const { giftsRepo, notificationService } = await getContainer()
  return handle(async () => {
    const { gift, contributionId } = await reserveGiftUseCase({
      giftsRepo,
      notificationService,
    })(input)
    return {
      id: gift.id,
      name: gift.name,
      kind: gift.kind,
      amount: gift.kind === 'fixed_item' ? gift.price : null,
      contributionId,
    }
  })
}
