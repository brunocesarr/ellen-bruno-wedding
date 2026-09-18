export class ExpenseNotFoundError extends Error {
  constructor() {
    super('Despesa não encontrada.')
    this.name = 'ExpenseNotFoundError'
  }
}

export class ExpenseDocumentNotFoundError extends Error {
  constructor() {
    super('Documento não encontrado.')
    this.name = 'ExpenseDocumentNotFoundError'
  }
}

/**
 * Raised before a document row is written, so the caller can still remove the
 * bytes it just uploaded (see `cleanup` in `document-upload.ts`). The message
 * is user-facing pt-BR and surfaces unchanged through `handle()`.
 */
export class ExpenseDocumentsQuotaExceededError extends Error {
  constructor(usedBytes: number, budgetBytes: number) {
    const mb = (n: number) => (n / 1024 / 1024).toFixed(0)
    super(
      `Limite de armazenamento de documentos atingido (${mb(usedBytes)} MB de ` +
        `${mb(budgetBytes)} MB). Remova algum documento antes de enviar outro.`
    )
    this.name = 'ExpenseDocumentsQuotaExceededError'
  }
}
