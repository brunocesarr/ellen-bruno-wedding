export class InviteLinkNotFoundError extends Error {
  constructor() {
    super('Link de convite não encontrado')
    this.name = 'InviteLinkNotFoundError'
  }
}

export class InviteLinkInactiveError extends Error {
  constructor() {
    super('Este link de convite não está mais ativo')
    this.name = 'InviteLinkInactiveError'
  }
}
