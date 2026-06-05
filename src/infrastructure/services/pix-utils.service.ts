import type { IPixService } from '@/src/application/services/pix.service.interface'
import type { PixQr } from '@/src/entities/models/pix'
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
      throw new Error(`Valor Pix inválido: ${amount}`)
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
    if (!pixKey) throw new Error('PIX_KEY não configurada')

    const reserved = 'br.gov.bcb.pix'.length + pixKey.length + 8 // TLV overhead
    const maxInfoLen = Math.max(0, 99 - reserved)
    const infoAdicional = sanitizeField(description, Math.min(maxInfoLen, 40))

    const pix = createStaticPix({
      merchantName,
      merchantCity,
      pixKey,
      ...(infoAdicional ? { infoAdicional } : {}),
      txid: sanitizeTxid(txid),
      transactionAmount: Math.round(value * 100) / 100,
    })

    if (hasError(pix)) {
      throw new Error('Falha ao gerar Pix: ' + JSON.stringify(pix.error))
    }

    const brCode = pix.toBRCode()
    const qrImage = await pix.toImage()
    return { brCode, qrImage }
  }
}
