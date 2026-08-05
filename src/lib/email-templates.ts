import type { EmailMessage } from '@/src/application/services/email.service.interface'
import type { RsvpRequest } from '@/src/entities/models/rsvp-request'

const COUPLE = 'Ellen & Bruno'

const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ellen-bruno-wedding.netlify.app'

const firstNameOf = (fullName: string): string => {
  const trimmed = fullName.trim()
  return trimmed.split(' ')[0] ?? trimmed
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/**
 * Returns an HTML *fragment*, not a full document.
 * Every major client (Gmail, Outlook, Apple Mail) strips doctype/html/head/body
 * from message bodies, so the page background is applied via an outer
 * full-width table instead. Resend accepts fragments as-is.
 */
function wrap(bodyHtml: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#faf6f1" style="margin:0;padding:32px 16px;background:#faf6f1;font-family:Georgia,'Times New Roman',serif;color:#3d3733;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto;background:#fffdfb;border:1px solid #e7ded4;border-radius:4px;">
        <tr>
          <td style="padding:40px 40px 32px;">
            <p style="margin:0 0 24px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#a8998a;">
              ${COUPLE}
            </p>
            ${bodyHtml}
            <p style="margin:32px 0 0;padding-top:24px;border-top:1px solid #eee6dc;font-size:12px;line-height:1.7;color:#a8998a;">
              Com carinho,<br />${COUPLE} 🤍
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

function approvedEmail(request: RsvpRequest): EmailMessage {
  const name = firstNameOf(request.fullName)
  const url = `${siteUrl()}/`

  const headline = request.attending
    ? 'Sua presença está confirmada!'
    : 'Recebemos seu recado'

  const body = request.attending
    ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.8;">Que alegria, ${escapeHtml(name)}! 💕</p>
       <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">
         Sua solicitação foi aprovada e seu nome já está na nossa lista de convidados.
         Mal podemos esperar para celebrar esse dia com você.
       </p>`
    : `<p style="margin:0 0 16px;font-size:16px;line-height:1.8;">Olá, ${escapeHtml(name)}!</p>
       <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">
         Recebemos e registramos sua resposta. Sentiremos sua falta, mas ficamos
         muito felizes com seu carinho em nos avisar.
       </p>`

  return {
    to: request.email,
    subject: request.attending
      ? `${name}, sua presença está confirmada! · ${COUPLE}`
      : `Recebemos sua resposta · ${COUPLE}`,
    html: wrap(`
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:400;color:#b5654a;">${headline}</h1>
      ${body}
      <p style="margin:28px 0 0;">
        <a href="${url}" style="display:inline-block;padding:13px 26px;background:#b5654a;color:#fffdfb;text-decoration:none;font-size:13px;letter-spacing:.08em;text-transform:uppercase;border-radius:2px;">
          Ver detalhes do casamento
        </a>
      </p>`),
    text: [
      request.attending ? `Que alegria, ${name}!` : `Olá, ${name}!`,
      '',
      request.attending
        ? 'Sua solicitação foi aprovada e seu nome já está na nossa lista de convidados. Mal podemos esperar para celebrar com você!'
        : 'Recebemos e registramos sua resposta. Sentiremos sua falta, mas obrigado pelo carinho de nos avisar.',
      '',
      `Detalhes: ${url}`,
      '',
      `Com carinho, ${COUPLE}`,
    ].join('\n'),
  }
}

function rejectedEmail(request: RsvpRequest): EmailMessage {
  const name = firstNameOf(request.fullName)

  return {
    to: request.email,
    subject: `Sobre sua solicitação · ${COUPLE}`,
    html: wrap(`
      <h1 style="margin:0 0 20px;font-size:26px;font-weight:400;color:#b5654a;">Obrigado pelo seu carinho</h1>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.8;">Olá, ${escapeHtml(name)}!</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.8;">
        Ficamos muito felizes com seu interesse em celebrar esse dia conosco.
        Infelizmente, nosso espaço tem lugares limitados e não conseguiremos
        incluir sua solicitação na lista de convidados.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.8;">
        Esperamos comemorar com você em uma próxima oportunidade. Obrigado pela
        compreensão e pelo carinho 🤍
      </p>`),
    text: [
      `Olá, ${name}!`,
      '',
      'Ficamos muito felizes com seu interesse em celebrar esse dia conosco. Infelizmente, nosso espaço tem lugares limitados e não conseguiremos incluir sua solicitação na lista de convidados.',
      '',
      'Esperamos comemorar com você em uma próxima oportunidade. Obrigado pela compreensão!',
      '',
      `Com carinho, ${COUPLE}`,
    ].join('\n'),
  }
}

export function buildRsvpDecisionEmail(request: RsvpRequest): EmailMessage {
  return request.status === 'approved'
    ? approvedEmail(request)
    : rejectedEmail(request)
}
