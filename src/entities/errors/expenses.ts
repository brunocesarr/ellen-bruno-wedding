export class ExpenseNotFoundError extends Error {
  constructor() {
    super('Despesa não encontrada.')
    this.name = 'ExpenseNotFoundError'
  }
}
