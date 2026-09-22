/**
 * The single failure mode of a manager token: unknown, revoked, expired and
 * malformed all surface identically, so a caller cannot probe which tokens
 * ever existed. Mirrors InviteLinkNotFoundError's reasoning.
 */
export class GuestManagerAccessDeniedError extends Error {
  constructor() {
    super('Este link de acesso não é válido ou foi desativado')
    this.name = 'GuestManagerAccessDeniedError'
  }
}
