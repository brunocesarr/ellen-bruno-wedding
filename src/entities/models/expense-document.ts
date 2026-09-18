import { z } from 'zod'

export const EXPENSE_DOCUMENT_KINDS = ['contract', 'payment_proof'] as const

export const ExpenseDocumentKindSchema = z.enum(EXPENSE_DOCUMENT_KINDS)
export type ExpenseDocumentKind = z.infer<typeof ExpenseDocumentKindSchema>

export const ExpenseDocumentSchema = z.object({
  id: z.string().uuid(),
  expenseId: z.string().uuid(),
  installmentId: z.string().uuid().nullable(),
  kind: ExpenseDocumentKindSchema,
  filePath: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  createdAt: z.date(),
})
export type ExpenseDocument = z.infer<typeof ExpenseDocumentSchema>

/**
 * What the repository needs to persist a document. The bytes are already in
 * storage by the time this is built — the upload happens in the server action
 * (see `document-upload.ts`), same ordering as the image uploads in
 * `site-images.actions.ts`.
 */
export type CreateExpenseDocumentData = Omit<
  ExpenseDocument,
  'id' | 'createdAt'
>

const emptyToNull = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? null : (v ?? null)

/**
 * Mirrors the `expense_documents_installment_kind_valid` CHECK: a contract
 * belongs to the expense, a comprovante may additionally point at the parcela
 * it paid for.
 */
export const UploadExpenseDocumentInputSchema = z
  .object({
    expenseId: z.string().uuid('Despesa inválida'),
    installmentId: z.preprocess(
      emptyToNull,
      z.string().uuid('Parcela inválida').nullable()
    ),
    kind: ExpenseDocumentKindSchema,
    filePath: z.string().min(1),
    fileName: z.string().min(1).max(255),
    mimeType: z.string().min(1),
    sizeBytes: z.number().int().positive(),
  })
  .superRefine((v, ctx) => {
    if (v.kind === 'contract' && v.installmentId !== null) {
      ctx.addIssue({
        code: 'custom',
        path: ['installmentId'],
        message: 'Um contrato pertence à despesa, não a uma parcela.',
      })
    }
  })
export type UploadExpenseDocumentInput = z.infer<
  typeof UploadExpenseDocumentInputSchema
>
