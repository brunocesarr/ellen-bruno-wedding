export class GuestNotFoundError extends Error {
  constructor() {
    super('Convidado não encontrado')
    this.name = 'GuestNotFoundError'
  }
}
export class InvalidInviteTokenError extends Error {
  constructor() {
    super('Convite inválido ou expirado')
    this.name = 'InvalidInviteTokenError'
  }
}
