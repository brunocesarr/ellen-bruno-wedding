import { z } from 'zod'

/**
 * `Number.isInteger(n * 100)` is unsafe: 10.99 * 100 === 1099.0000000000002,
 * so valid input would be rejected. Compare to the rounded value with epsilon.
 * Mirrors the `money` helper in `gift.ts`.
 */
const money = (max = 1_000_000) =>
  z.coerce
    .number()
    .positive()
    .max(max)
    .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, {
      message: 'Use no máximo 2 casas decimais',
    })

const paidAmount = z.coerce
  .number()
  .min(0)
  .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, {
    message: 'Use no máximo 2 casas decimais',
  })

export const ExpenseInstallmentSchema = z.object({
  id: z.string().uuid(),
  dueDate: z.string(), // date-only, "YYYY-MM-DD"
  amount: z.number(),
  paidAmount: z.number(),
  paidBy: z.string().nullable(),
})
export type ExpenseInstallment = z.infer<typeof ExpenseInstallmentSchema>

export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  totalAmount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  installments: z.array(ExpenseInstallmentSchema),
})
export type Expense = z.infer<typeof ExpenseSchema>

const InstallmentInputSchema = z.object({
  dueDate: z.string().min(1, 'Informe a data de vencimento'),
  amount: money(),
  paidAmount: paidAmount.default(0),
  paidBy: z
    .string()
    .max(120)
    .optional()
    .transform((v) => (v && v.trim() !== '' ? v.trim() : undefined)),
})

/**
 * Explicit `path` on every issue, same convention as `gift.ts`'s `kindRules`:
 * z.flattenError() turns those into fieldErrors, which is what the admin
 * dialog reads to place messages on the right field/row.
 */
const expenseRules = (
  v: {
    totalAmount: number
    installments: z.infer<typeof InstallmentInputSchema>[]
  },
  ctx: z.RefinementCtx
) => {
  const sum = v.installments.reduce((s, i) => s + i.amount, 0)
  if (Math.abs(sum * 100 - v.totalAmount * 100) > 1) {
    ctx.addIssue({
      code: 'custom',
      path: ['installments'],
      message: `A soma das parcelas (${sum.toFixed(2)}) deve ser igual ao valor total (${v.totalAmount.toFixed(2)})`,
    })
  }

  for (const [i, inst] of v.installments.entries()) {
    if (inst.paidAmount > inst.amount + 1e-6) {
      ctx.addIssue({
        code: 'custom',
        path: ['installments', i, 'paidAmount'],
        message: 'Valor pago maior que o valor da parcela',
      })
    }
  }
}

const ExpenseInputBase = z.object({
  description: z.string().min(1, 'Informe a descrição').max(200),
  totalAmount: money(),
  installments: z
    .array(InstallmentInputSchema)
    .min(1, 'Adicione ao menos uma parcela'),
})

// The form always resubmits the full installment set, so there's no
// partial-update case to support — unlike gift.ts's UpdateGiftInputSchema.
export const CreateExpenseInputSchema =
  ExpenseInputBase.superRefine(expenseRules)
export type CreateExpenseInput = z.infer<typeof CreateExpenseInputSchema>

export const UpdateExpenseInputSchema = ExpenseInputBase.extend({
  id: z.string().uuid(),
}).superRefine(expenseRules)
export type UpdateExpenseInput = z.infer<typeof UpdateExpenseInputSchema>
