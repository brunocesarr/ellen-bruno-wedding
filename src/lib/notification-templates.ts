import type { RsvpRequest } from '@/src/entities/models/rsvp-request'

const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ellen-bruno-wedding.netlify.app'

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

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
