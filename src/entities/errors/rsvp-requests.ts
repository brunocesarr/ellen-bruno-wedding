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

export class RsvpRequestNotDecidedError extends Error {
  constructor() {
    super('Só é possível reenviar o aviso após aprovar ou recusar')
    this.name = 'RsvpRequestNotDecidedError'
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
 * Raised ONLY by the explicit "resend notification" action, where the admin
 * asked for an e-mail and deserves to see it fail. The decide flow never throws
 * this: the decision is committed regardless and the failure is recorded on the
 * row for retry.
 */
export class RsvpDecisionEmailFailedError extends Error {
  constructor(reason?: string) {
    super(
      'Não conseguimos enviar o e-mail agora. A decisão foi mantida — ' +
        'você pode tentar reenviar o aviso em instantes.' +
        (reason ? ` (Detalhe: ${reason})` : '')
    )
    this.name = 'RsvpDecisionEmailFailedError'
  }
}
