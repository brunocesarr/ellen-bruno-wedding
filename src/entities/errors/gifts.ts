export class GiftAlreadyReservedError extends Error {
  constructor() {
    super('Este presente já foi reservado.')
    this.name = 'GiftAlreadyReservedError'
  }
}
export class GiftNotFoundError extends Error {
  constructor() {
    super('Presente não encontrado.')
    this.name = 'GiftNotFoundError'
  }
}
export class GiftAmountRequiredError extends Error {
  constructor() {
    super('Informe o valor da sua contribuição.')
    this.name = 'GiftAmountRequiredError'
  }
}
export class GiftAmountTooLowError extends Error {
  constructor(min?: number) {
    super(
      min && min > 0
        ? `O valor mínimo é R$ ${min.toFixed(2).replace('.', ',')}.`
        : 'Valor inválido.'
    )
    this.name = 'GiftAmountTooLowError'
  }
}
export class GiftKindLockedError extends Error {
  constructor() {
    super('Não é possível mudar o tipo: já existem contribuições.')
    this.name = 'GiftKindLockedError'
  }
}
export class GiftHasContributionsError extends Error {
  constructor() {
    super('Não é possível excluir: já existem contribuições.')
    this.name = 'GiftHasContributionsError'
  }
}
export class CardPaymentUnavailableError extends Error {
  constructor() {
    super('Pagamento por cartão indisponível para este valor.')
    this.name = 'CardPaymentUnavailableError'
  }
}
