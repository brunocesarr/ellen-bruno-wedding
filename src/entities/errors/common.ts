/** Shape produced by Zod's `flattenError` — carried on validation failures. */
export type ValidationIssues = {
  formErrors: string[]
  fieldErrors: Record<string, string[]>
}

export class ValidationError extends Error {
  constructor(public readonly issues: ValidationIssues) {
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
