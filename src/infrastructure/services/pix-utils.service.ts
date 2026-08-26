import { createStaticPix, hasError } from 'pix-utils'

import type { IPixService } from '@/src/application/services/pix.service.interface'
import { InvalidPixCodeError } from '@/src/entities/errors/pix'
import type { PixQr } from '@/src/entities/models/pix'
import { dumpBRCode, validateBRCode } from '@/src/lib/br-code'
import {
  PIX_MAX,
  infoAdicionalBudget,
  normalizePixKey,
  requirePixAmount,
  toAsciiField,
  validatePixInputs,
  type PixKeyType,
} from '@/src/lib/pix-sanitize'

type CreateStaticPixParams = Parameters<typeof createStaticPix>[0]

export type PixMerchantConfig = {
  pixKey: string
  /** Pass when the key is a mobile — bare 11 digits default to CPF. */
  pixKeyType?: PixKeyType
  merchantName: string
  merchantCity: string
}

export class PixUtilsService implements IPixService {
  private readonly config: PixMerchantConfig

  constructor(config?: Partial<PixMerchantConfig>) {
    const pixKey = config?.pixKey ?? process.env.PIX_KEY ?? ''
    if (!pixKey) throw new InvalidPixCodeError('PIX_KEY is not configured')

    this.config = {
      pixKey,
      pixKeyType:
        config?.pixKeyType ??
        (process.env.PIX_KEY_TYPE as PixKeyType | undefined),
      merchantName:
        config?.merchantName ??
        process.env.PIX_MERCHANT_NAME ??
        'ELLEN E BRUNO',
      merchantCity:
        config?.merchantCity ??
        process.env.PIX_MERCHANT_CITY ??
        'BELO HORIZONTE',
    }
  }

  async generateStaticQr(input: {
    amount: number
    description: string
  }): Promise<PixQr> {
    const pix = this.createPix(input)
    const brCode = this.assertValid(pix.toBRCode(), input)
    const qrCodeImage = await pix.toImage()

    // Field names come from PixQr — rename here if yours differ.
    return { brCode, qrImage: qrCodeImage } satisfies PixQr
  }

  private createPix(input: { amount: number; description: string }) {
    const key = normalizePixKey(this.config.pixKey, this.config.pixKeyType)
    const name = toAsciiField(this.config.merchantName, PIX_MAX.merchantName)
    const city = toAsciiField(this.config.merchantCity, PIX_MAX.merchantCity)

    // `description` is nested inside tag 26 by pix-utils. Past 99 bytes the
    // library emits a 3-digit length and every bank rejects the payload.
    const budget = Math.min(PIX_MAX.infoAdicional, infoAdicionalBudget(key))
    const info = input.description
      ? toAsciiField(input.description, budget) || undefined
      : undefined

    const preflight = validatePixInputs({
      pixKey: key,
      merchantName: name,
      merchantCity: city,
      infoAdicional: info,
    })
    if (preflight) throw new InvalidPixCodeError(preflight)

    let transactionAmount: number
    try {
      transactionAmount = requirePixAmount(input.amount)
    } catch (error) {
      throw new InvalidPixCodeError((error as Error).message)
    }

    const params: CreateStaticPixParams = {
      pixKey: key,
      merchantName: name,
      merchantCity: city,
      transactionAmount,
      txid: '***',
      ...(info ? { infoAdicional: info } : {}),
    }

    const pix = createStaticPix(params)

    // hasError() validates INPUTS only — it never inspects the emitted
    // payload, which is why the tag-26 overflow passed silently.
    if (hasError(pix)) throw new InvalidPixCodeError(pix.message)

    return pix
  }

  private assertValid(
    brCode: string,
    input: { amount: number; description: string }
  ): string {
    const reason = validateBRCode(brCode)
    if (reason) {
      console.error('[pix] invalid BR Code\n' + dumpBRCode(brCode), {
        reason,
        amount: input.amount,
        descriptionBytes: new TextEncoder().encode(input.description).length,
        pixKeyTail: this.config.pixKey.slice(-4),
      })
      throw new InvalidPixCodeError(reason)
    }
    return brCode
  }
}
