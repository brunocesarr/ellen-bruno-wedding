import type { IPixService } from '@/src/application/services/pix.service.interface'
import { InvalidPixCodeError, PixError } from '@/src/entities/errors/pix'
import type { PixQr } from '@/src/entities/models/pix'
import { validateBRCode } from '@/src/lib/br-code'
import {
  PIX_MAX,
  normalizePixKey,
  toAsciiField,
  toPixAmount,
} from '@/src/lib/pix-sanitize'
import { createStaticPix, hasError } from 'pix-utils'

function toAscii(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function sanitizeField(value: string, maxLen: number): string {
  return toAscii(value).slice(0, maxLen)
}

function sanitizeTxid(value?: string): string {
  const clean = (value ?? '').replace(/[^A-Za-z0-9]/g, '').slice(0, 25)
  return clean.length > 0 ? clean : '***'
}

export class PixUtilsService implements IPixService {
  async generateStaticQr({
    amount,
    description,
    txid,
  }: {
    amount: number
    description: string
    txid?: string
  }): Promise<PixQr> {
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      throw new PixError(`Valor Pix inválido: ${amount}`)
    }

    const merchantName = sanitizeField(
      process.env.PIX_MERCHANT_NAME ?? 'Casamento EB',
      25
    )
    const merchantCity = sanitizeField(
      process.env.PIX_MERCHANT_CITY ?? 'UNKNOWN',
      15
    )
    const pixKey = (process.env.PIX_KEY ?? '').trim()
    const pixAmount = toPixAmount(value)
    if (!pixKey || !pixAmount) throw new PixError('PIX_KEY ou valor inválido')

    const reserved = 'br.gov.bcb.pix'.length + pixKey.length + 8
    const maxInfoLen = Math.max(0, 99 - reserved)
    const infoAdicional = sanitizeField(description, Math.min(maxInfoLen, 40))

    const pix = createStaticPix({
      merchantName: toAsciiField(merchantName, PIX_MAX.merchantName),
      merchantCity: toAsciiField(merchantCity, PIX_MAX.merchantCity),
      pixKey: normalizePixKey(pixKey),
      ...(infoAdicional ? { infoAdicional } : {}),
      txid: sanitizeTxid(txid),
      transactionAmount: pixAmount,
    })

    if (hasError(pix)) throw new InvalidPixCodeError(pix.message)

    const brCode = pix.toBRCode()
    const qrImage = await pix.toImage()

    const reason = validateBRCode(brCode)
    if (reason) {
      // Log the payload so the offending field can be inspected in server logs.
      console.error('[pix] invalid BR Code', {
        reason,
        brCode,
        inputs: {
          pixKey,
          merchantName,
          merchantCity,
          amount,
          typeofAmount: typeof amount,
        },
      })
      throw new InvalidPixCodeError(reason)
    }

    return { brCode, qrImage }
  }
}
