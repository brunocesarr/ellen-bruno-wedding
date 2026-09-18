import type {
  ExpenseDocument,
  ExpenseDocumentKind,
} from '@/src/entities/models/expense-document'
import { formatBytes } from '@/src/lib/format'

export type ExpenseDocumentViewModel = {
  id: string
  expenseId: string
  installmentId: string | null
  kind: ExpenseDocumentKind
  kindLabel: string
  fileName: string
  sizeBytes: number
  sizeLabel: string
  /** Drives the chip icon and whether the viewer renders an <img> or an iframe. */
  isPdf: boolean
  uploadedAtLabel: string
}

const KIND_LABEL: Record<ExpenseDocumentKind, string> = {
  contract: 'Contrato',
  payment_proof: 'Comprovante',
}

/**
 * No URL here on purpose. The bytes live in a private bucket, so every URL is
 * a signed, expiring one — minted by `getExpenseDocumentUrlAction` when the
 * admin actually opens a document, not for every chip on every render.
 */
export function toExpenseDocumentViewModel(
  d: ExpenseDocument
): ExpenseDocumentViewModel {
  return {
    id: d.id,
    expenseId: d.expenseId,
    installmentId: d.installmentId,
    kind: d.kind,
    kindLabel: KIND_LABEL[d.kind],
    fileName: d.fileName,
    sizeBytes: d.sizeBytes,
    sizeLabel: formatBytes(d.sizeBytes),
    isPdf: d.mimeType === 'application/pdf',
    uploadedAtLabel: d.createdAt.toLocaleDateString('pt-BR'),
  }
}
