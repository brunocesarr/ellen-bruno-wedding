export class RsvpRequestNotFoundError extends Error {
  constructor() {
    super('Solicitação não encontrada')
    this.name = 'RsvpRequestNotFoundError'
  }
}

export class RsvpRequestAlreadyDecidedError extends Error {
  constructor() {
    super('Esta solicitação já foi respondida')
    this.name = 'RsvpRequestAlreadyDecidedError'
  }
}

export class DuplicateRsvpRequestError extends Error {
  constructor() {
    super(
      'Já recebemos uma solicitação com este e-mail. Em breve entraremos em contato 💛'
    )
    this.name = 'DuplicateRsvpRequestError'
  }
}

/**
 * Raised when the notification e-mail could not be delivered. The decision is
 * intentionally NOT applied in this case, so the message tells the admin the
 * request is still pending and safe to retry.
 */
export class RsvpDecisionEmailFailedError extends Error {
  constructor(reason?: string) {
    super(
      'Não conseguimos enviar o e-mail de aviso, então a decisão NÃO foi aplicada. ' +
        'A solicitação continua pendente — tente novamente em instantes.' +
        (reason ? ` (Detalhe: ${reason})` : '')
    )
    this.name = 'RsvpDecisionEmailFailedError'
  }
}
