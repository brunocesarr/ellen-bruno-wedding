export class UnauthenticatedError extends Error {
  constructor() {
    super('Você precisa estar autenticado')
    this.name = 'UnauthenticatedError'
  }
}
export class InvalidCredentialsError extends Error {
  constructor() {
    super('E-mail ou senha inválidos')
    this.name = 'InvalidCredentialsError'
  }
}
