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
