import type { Gift, GiftKind } from '@/src/entities/models/gift'
import type { RsvpRequest } from '@/src/entities/models/rsvp-request'
import { formatCurrencyBRL } from '@/src/lib/format'

const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ellen-bruno-wedding.netlify.app'

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const KIND_LABEL: Record<GiftKind, string> = {
  fixed_item: 'Presente',
  open_item: 'Presente (valor livre)',
  fund: 'Contribuição na vaquinha',
}

export function buildRsvpRequestAlert(request: RsvpRequest): string {
  const lines = [
    '🔔 <b>Nova solicitação de RSVP</b>',
    '',
    `👤 ${escapeHtml(request.fullName)}`,
    `📧 ${escapeHtml(request.email)}`,
    request.attending ? '✅ Vai comparecer' : '❌ Não vai comparecer',
  ]

  if (request.message) {
    lines.push(`💬 "${escapeHtml(request.message)}"`)
  }

  lines.push('', `Ver no painel: ${siteUrl()}/admin/solicitacoes`)

  return lines.join('\n')
}

/**
 * Fired the moment a gift is reserved via Pix — before the money is actually
 * confirmed. For a fixed_item that's `gift.price`; for open_item/fund it's
 * whatever the guest chose to pledge, so pass it in explicitly rather than
 * reading a field off `gift`.
 */
export function buildGiftReservedAlert(params: {
  gift: Gift
  buyerName: string
  amount: number | null
  buyerMessage?: string | null
}): string {
  const { gift, buyerName, amount, buyerMessage } = params

  const lines = [
    '🎁 <b>Presente reservado</b> (aguardando Pix)',
    '',
    `${KIND_LABEL[gift.kind]}: ${escapeHtml(gift.name)}`,
    `👤 ${escapeHtml(buyerName)}`,
    amount != null ? `💰 ${formatCurrencyBRL(amount)}` : null,
  ].filter((line): line is string => line !== null)

  if (buyerMessage) {
    lines.push(`💬 "${escapeHtml(buyerMessage)}"`)
  }

  lines.push('', `Ver no painel: ${siteUrl()}/admin/presentes`)

  return lines.join('\n')
}

/** Fired when a card payment is confirmed — money already in hand. */
export function buildGiftPaymentConfirmedAlert(params: {
  giftName: string
  buyerName: string
  amount: number
}): string {
  const { giftName, buyerName, amount } = params

  return [
    '💳 <b>Pagamento confirmado</b>',
    '',
    `Presente: ${escapeHtml(giftName)}`,
    `👤 ${escapeHtml(buyerName)}`,
    `💰 ${formatCurrencyBRL(amount)}`,
    '',
    `Ver no painel: ${siteUrl()}/admin/presentes`,
  ].join('\n')
}

/**
 * The payment came in but couldn't be tied to a gift (it was deleted, or lost
 * a race with another payment) — needs a human to reconcile it manually.
 */
const CARD_PROVIDER_LABEL: Record<'mercado_pago' | 'pagbank', string> = {
  mercado_pago: 'Mercado Pago',
  pagbank: 'PagBank',
}

export function buildUntiedPaymentAlert(params: {
  buyerName: string
  amount: number
  provider?: 'mercado_pago' | 'pagbank'
}): string {
  const { buyerName, amount, provider } = params
  const providerLabel = provider ? CARD_PROVIDER_LABEL[provider] : null

  return [
    '⚠️ <b>Pagamento recebido sem presente vinculado</b>',
    '',
    `👤 ${escapeHtml(buyerName)}`,
    `💰 ${formatCurrencyBRL(amount)}`,
    '',
    providerLabel
      ? `Verifique e reembolse pelo painel do ${providerLabel} se necessário.`
      : 'Verifique e reembolse pelo painel do provedor de pagamento se necessário.',
    `Ver no painel: ${siteUrl()}/admin/resumo`,
  ].join('\n')
}
