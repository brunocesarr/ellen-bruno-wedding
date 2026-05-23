import type { IPixService } from '@/src/application/services/pix.service.interface'
import type { PixQr } from '@/src/entities/models/pix'
import { createStaticPix, hasError } from 'pix-utils'

export class PixUtilsService implements IPixService {
  async generateStaticQr({
    amount,
    description,
  }: {
    amount: number
    description: string
  }): Promise<PixQr> {
    const pix = createStaticPix({
      merchantName: process.env.PIX_MERCHANT_NAME ?? 'Casamento',
      merchantCity: process.env.PIX_MERCHANT_CITY ?? 'SAO PAULO',
      pixKey: process.env.PIX_KEY!,
      infoAdicional: description.slice(0, 50),
      transactionAmount: Number(amount.toFixed(2)),
    })
    if (hasError(pix)) throw new Error('Falha ao gerar Pix: ' + pix.error)
    const brCode = pix.toBRCode()
    const qrImage = await pix.toImage()
    return { brCode, qrImage }
  }
}
