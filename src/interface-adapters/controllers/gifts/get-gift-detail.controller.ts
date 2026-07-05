import { getGiftUseCase } from '@/src/application/use-cases/gifts/get-gift.use-case'
import { generatePixQrUseCase } from '@/src/application/use-cases/pix/generate-pix-qr.use-case'
import { getContainer } from '@/src/di/container'
import {
  toGiftViewModel,
  type GiftViewModel,
} from '@/src/interface-adapters/view-models/gift.view-model'

export type GiftDetail = {
  giftView: GiftViewModel
  pix: { brCode: string; qrImage: string }
  reservation: {
    giftId: string
    isReserved: boolean
    reservedByName: string | null
    reservedMessage: string | null
  }
}

export async function getGiftDetailController(id: string): Promise<GiftDetail> {
  const { giftsRepo, pixService, storageRepo } = await getContainer()

  const gift = await getGiftUseCase({ giftsRepo })(id)

  const pix = await generatePixQrUseCase({ pixService })({
    amount: gift.price,
    description: `Presente: ${gift.name}`,
  })

  const giftView = toGiftViewModel(
    { ...gift, status: gift.isReserved ? 'reserved' : 'pending' },
    storageRepo
  )

  return {
    giftView,
    pix,
    reservation: {
      giftId: gift.id,
      isReserved: gift.isReserved,
      reservedByName: gift.reservedByName,
      reservedMessage: gift.reservedMessage,
    },
  }
}
