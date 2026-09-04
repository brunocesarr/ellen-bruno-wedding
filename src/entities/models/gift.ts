import { z } from 'zod'

export const GiftCategorySchema = z.enum([
  'home',
  'kitchen',
  'travel',
  'experience',
  'other',
])
export type GiftCategory = z.infer<typeof GiftCategorySchema>

export const GIFT_KINDS = ['fixed_item', 'open_item', 'fund'] as const
export const GiftKindSchema = z.enum(GIFT_KINDS)
export type GiftKind = z.infer<typeof GiftKindSchema>

/**
 * `Number.isInteger(n * 100)` is unsafe: 10.99 * 100 === 1099.0000000000002,
 * so valid input would be rejected. Compare to the rounded value with epsilon.
 * Matters because PixUtilsService does Math.round(value * 100) / 100 — better
 * to reject at the boundary than silently turn 10.999 into 11.00.
 */
const money = (max = 50_000) =>
  z.coerce
    .number()
    .positive()
    .max(max)
    .refine((n) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-6, {
      message: 'Use no máximo 2 casas decimais',
    })

export const GiftSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable(),
  price: z.number().positive().nullable(), // null for open_item / fund
  imagePath: z.string().nullable(),
  isReserved: z.boolean(),
  reservedByName: z.string().nullable(),
  reservedMessage: z.string().nullable(),
  reservedAt: z.date().nullable(),
  category: GiftCategorySchema,
  kind: GiftKindSchema,
  minAmount: z.number().positive().nullable(),
  suggestedAmounts: z.array(z.number().positive()),
  goalAmount: z.number().positive().nullable(),
  paymentLink: z.string().url().nullable(), // fixed_item only
  confirmedTotal: z.number(),
  pledgedTotal: z.number(),
  contributorCount: z.number().int(),
  viewCount: z.number().int(),
})
export type Gift = z.infer<typeof GiftSchema>

/**
 * Bare object, no refinement. `.superRefine()` returns a wrapper type that has
 * no `.partial()`, so UpdateGiftInputSchema must derive from the unrefined base.
 */
const GiftInputBase = z.object({
  name: z.string().min(1, 'Informe o nome').max(120),
  description: z.string().max(500).optional(),
  imagePath: z.string().optional(),
  category: GiftCategorySchema.default('other'),
  kind: GiftKindSchema.default('fixed_item'),
  price: money().optional(),
  minAmount: money().optional(),
  suggestedAmounts: z.array(money()).max(4).default([]),
  goalAmount: money(1_000_000).optional(),
  paymentLink: z.string().url('Informe uma URL válida').optional(),
})

/**
 * Explicit `path` on every issue: z.flattenError() turns those into fieldErrors,
 * which is exactly the shape the admin dialog reads to place messages on inputs.
 */
const kindRules = (v: z.infer<typeof GiftInputBase>, ctx: z.RefinementCtx) => {
  if (v.kind === 'fixed_item') {
    if (v.price == null)
      ctx.addIssue({
        code: 'custom',
        path: ['price'],
        message: 'Informe o preço',
      })
    if (v.minAmount != null)
      ctx.addIssue({
        code: 'custom',
        path: ['minAmount'],
        message: 'Não se aplica a preço fixo',
      })
    if (v.suggestedAmounts.length > 0)
      ctx.addIssue({
        code: 'custom',
        path: ['suggestedAmounts'],
        message: 'Não se aplica a preço fixo',
      })
  } else {
    if (v.price != null)
      ctx.addIssue({
        code: 'custom',
        path: ['price'],
        message: 'Remova o preço fixo',
      })
    if (v.paymentLink != null)
      ctx.addIssue({
        code: 'custom',
        path: ['paymentLink'],
        message: 'Link de pagamento só se aplica a preço fixo',
      })
  }

  if (v.kind !== 'fund' && v.goalAmount != null)
    ctx.addIssue({
      code: 'custom',
      path: ['goalAmount'],
      message: 'Meta só se aplica a vaquinhas',
    })

  if (v.minAmount != null && v.goalAmount != null && v.minAmount > v.goalAmount)
    ctx.addIssue({
      code: 'custom',
      path: ['minAmount'],
      message: 'Mínimo maior que a meta',
    })

  for (const [i, s] of v.suggestedAmounts.entries())
    if (v.minAmount != null && s < v.minAmount)
      ctx.addIssue({
        code: 'custom',
        path: ['suggestedAmounts', i],
        message: 'Abaixo do mínimo',
      })
}

export const CreateGiftInputSchema = GiftInputBase.superRefine(kindRules)
export type CreateGiftInput = z.infer<typeof CreateGiftInputSchema>

/**
 * Deliberately unrefined: with every field optional you cannot distinguish an
 * omitted `kind` from a changed one. The CHECK constraint and the kind-lock
 * trigger are the real authority.
 */
export const UpdateGiftInputSchema = GiftInputBase.partial().extend({
  id: z.string().uuid(),
})
export type UpdateGiftInput = z.infer<typeof UpdateGiftInputSchema>

export const ReserveGiftInputSchema = z.object({
  giftId: z.string().uuid(),
  name: z.string().min(2, 'Informe seu nome').max(120),
  message: z.string().max(500).optional(),
  amount: money().optional(), // required for open_item/fund — the RPC enforces
})
export type ReserveGiftInput = z.infer<typeof ReserveGiftInputSchema>
