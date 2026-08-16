'use server'

import { getContainer } from '@/src/di/container'
import type { GiftKind } from '@/src/entities/models/gift'
import { listGiftsController } from '@/src/interface-adapters/controllers/gifts/list-gifts.controller'
import {
  createGiftController,
  deleteGiftController,
  updateGiftController,
} from '@/src/interface-adapters/controllers/gifts/manage-gift.controller'
import { getFile, getOptionalString } from '@/src/lib/form-data'
import { revalidateGroup } from '@/src/lib/revalidate'
import type { ActionResult } from '@/src/lib/server-action-result'
import { uploadImageIfPresent } from '@/src/lib/storage-upload'

type GiftMutationResult = ActionResult<{ id: string; name: string }>

export type GiftFormActionState = GiftMutationResult | null

/**
 * `fd.get()` returns the FIRST match. If a stale radio ever coexists with the
 * hidden input, that silently wins over the real selection — and a console dump
 * built with Object.fromEntries (which keeps the LAST) would show the correct
 * value, hiding the bug. Read the last non-empty entry instead.
 */
function getLastString(fd: FormData, key: string): string | undefined {
  const values = fd.getAll(key)
  for (let i = values.length - 1; i >= 0; i--) {
    const value = values[i]
    if (typeof value === 'string' && value.length > 0) return value
  }
  return undefined
}

/**
 * Suggestion chips arrive as one comma-separated field ("50, 150, 300").
 * Accepts a Brazilian decimal comma per entry ("50,5") and caps at 4 to match
 * both the Zod .max(4) and the gifts_suggested_amounts_valid CHECK.
 * An empty field yields [] — valid for every kind.
 */
function parseSuggested(formData: FormData): number[] {
  return (getOptionalString(formData, 'suggestedAmounts') ?? '')
    .split(',')
    .map((part) => Number(part.trim().replace(',', '.')))
    .filter((n) => Number.isFinite(n) && n > 0)
    .slice(0, 4)
}

/**
 * Derives every amount field from `kind`, mirroring the gifts_kind_valid CHECK.
 * A stale or replayed `price` can therefore never reach the schema for a fund,
 * and a stale `goalAmount` can never reach an open_item.
 */
function readGiftFields(formData: FormData) {
  const kind = (getLastString(formData, 'kind') ?? 'fixed_item') as GiftKind
  const isFixed = kind === 'fixed_item'

  return {
    name: getOptionalString(formData, 'name'),
    description: getOptionalString(formData, 'description'),
    category: getOptionalString(formData, 'category'),

    kind,
    price: isFixed ? getOptionalString(formData, 'price') : undefined,
    minAmount: isFixed ? undefined : getOptionalString(formData, 'minAmount'),
    goalAmount:
      kind === 'fund' ? getOptionalString(formData, 'goalAmount') : undefined,
    suggestedAmounts: isFixed ? [] : parseSuggested(formData),
  }
}

export async function createGiftAction(
  _: unknown,
  formData: FormData
): Promise<GiftMutationResult> {
  const { storageRepo } = await getContainer()
  const upload = await uploadImageIfPresent(
    storageRepo,
    getFile(formData, 'image'),
    'gifts'
  )
  if (!upload.ok) return { ok: false, error: upload.error }

  const fields = readGiftFields(formData)

  // TEMPORARY — remove once verified. Confirms what the schema actually sees.
  console.log('[createGiftAction] kind:', fields.kind, 'price:', fields.price)

  const result = await createGiftController({
    ...fields,
    imagePath: upload.imagePath,
  })

  if (!result.ok) await upload.cleanup?.()
  else revalidateGroup('gifts')

  return result
}

export async function updateGiftAction(
  _: unknown,
  formData: FormData
): Promise<GiftMutationResult> {
  const { storageRepo } = await getContainer()
  const upload = await uploadImageIfPresent(
    storageRepo,
    getFile(formData, 'image'),
    'gifts'
  )
  if (!upload.ok) return { ok: false, error: upload.error }

  const fields = readGiftFields(formData)

  const result = await updateGiftController({
    id: getOptionalString(formData, 'id'),
    ...fields,
    ...(upload.imagePath ? { imagePath: upload.imagePath } : {}),
  })

  if (!result.ok) await upload.cleanup?.()
  else revalidateGroup('gifts')

  return result
}

export async function deleteGiftAction(id: string) {
  const result = await deleteGiftController(id)
  if (result.ok) revalidateGroup('gifts')
  return result
}

export async function listGiftsAction() {
  return listGiftsController()
}
