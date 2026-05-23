export class ValidationError extends Error {
  constructor(public readonly issues: unknown) {
    super('Dados inválidos')
    this.name = 'ValidationError'
  }
}
export class NotFoundError extends Error {
  constructor(resource = 'Recurso') {
    super(`${resource} não encontrado`)
    this.name = 'NotFoundError'
  }
}
export class UnexpectedError extends Error {
  constructor(message = 'Algo deu errado') {
    super(message)
    this.name = 'UnexpectedError'
  }
}
