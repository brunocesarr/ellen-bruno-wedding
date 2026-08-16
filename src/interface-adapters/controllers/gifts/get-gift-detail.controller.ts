import { getGiftUseCase } from '@/src/application/use-cases/gifts/get-gift.use-case'
import { generatePixQrUseCase } from '@/src/application/use-cases/pix/generate-pix-qr.use-case'
import { getContainer } from '@/src/di/container'
import type { ReservationStatus } from '@/src/entities/models/dashboard'
import {
  toGiftViewModel,
  type GiftViewModel,
} from '@/src/interface-adapters/view-models/gift.view-model'

export type GiftDetail = {
  giftView: GiftViewModel
  // null for open_item / fund: the amount is chosen by the guest, so the QR is
  // generated on demand by generateGiftPixAction instead of at render time.
  pix: { brCode: string; qrImage: string } | null
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

  // Only fixed_item has an amount at render time. Calling the PIX service with
  // a null price is what produced "Valor Pix inválido: null".
  const pix =
    gift.kind === 'fixed_item' && gift.price != null
      ? await generatePixQrUseCase({ pixService })({
          amount: gift.price,
          description: `Presente: ${gift.name}`,
        })
      : null

  // Mirrors listGiftsUseCase: funds never set is_reserved, so isReserved alone
  // would pin every fund to 'pending' forever.
  const status: ReservationStatus =
    gift.kind === 'fund'
      ? gift.confirmedTotal > 0
        ? 'thanked'
        : 'pending'
      : gift.isReserved
        ? gift.confirmedTotal > 0
          ? 'thanked'
          : 'reserved'
        : 'pending'

  const giftView = toGiftViewModel({ ...gift, status }, storageRepo)

  return {
    giftView,
    pix,
    reservation: {
      giftId: gift.id,
      // A fund is never "already reserved" — it always accepts more.
      isReserved: gift.kind !== 'fund' && gift.isReserved,
      reservedByName: gift.reservedByName,
      reservedMessage: gift.reservedMessage,
    },
  }
}
