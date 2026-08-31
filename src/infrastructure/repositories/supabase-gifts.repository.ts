import type {
  IGiftsRepository,
  ReserveGiftConfirmedParams,
  ReserveGiftParams,
  ReserveGiftResult,
} from '@/src/application/repositories/gifts.repository.interface'
import {
  GiftAlreadyReservedError,
  GiftAmountRequiredError,
  GiftAmountTooLowError,
  GiftHasContributionsError,
  GiftKindLockedError,
  GiftNotFoundError,
} from '@/src/entities/errors/gifts'
import type {
  CreateGiftInput,
  Gift,
  UpdateGiftInput,
} from '@/src/entities/models/gift'
import type {
  GiftInsert,
  GiftTotalsRow,
  GiftUpdate,
  ReserveGiftArgs,
  ReserveGiftPaidArgs,
} from '@/src/infrastructure/supabase/db-types'
import type { TypedSupabaseClient } from '@/src/infrastructure/supabase/types'

const num = (v: number | string | null | undefined, fallback = 0): number => {
  const n = typeof v === 'string' ? Number(v) : v
  return n == null || Number.isNaN(n) ? fallback : n
}

// Every column arrives nullable from the view (Supabase cannot infer NOT NULL
// through a view), so each one is coalesced rather than asserted.
const mapRow = (r: GiftTotalsRow): Gift => ({
  id: r.id ?? '',
  name: r.name ?? '',
  description: r.description,
  price: r.price == null ? null : num(r.price),
  imagePath: r.image_path,
  isReserved: r.is_reserved ?? false,
  reservedByName: r.reserved_by_name,
  reservedByEmail: r.reserved_by_email,
  reservedMessage: r.reserved_message,
  reservedAt: r.reserved_at ? new Date(r.reserved_at) : null,
  category: (r.category ?? 'other') as Gift['category'],
  kind: (r.kind ?? 'fixed_item') as Gift['kind'],
  minAmount: r.min_amount == null ? null : num(r.min_amount),
  suggestedAmounts: (r.suggested_amounts ?? []).map((a) => num(a)),
  goalAmount: r.goal_amount == null ? null : num(r.goal_amount),
  confirmedTotal: num(r.confirmed_total),
  pledgedTotal: num(r.pledged_total),
  contributorCount: num(r.contributor_count),
})

// Follows the existing error.message.includes(...) convention.
function mapSentinel(msg: string): Error | null {
  if (msg.includes('GIFT_ALREADY_RESERVED'))
    return new GiftAlreadyReservedError()
  if (msg.includes('GIFT_AMOUNT_REQUIRED')) return new GiftAmountRequiredError()
  if (msg.includes('GIFT_AMOUNT_TOO_LOW')) {
    const m = msg.match(/GIFT_AMOUNT_TOO_LOW:([\d.]+)/)
    return new GiftAmountTooLowError(m?.[1] ? Number(m[1]) : undefined)
  }
  if (msg.includes('GIFT_NOT_FOUND')) return new GiftNotFoundError()
  if (msg.includes('GIFT_KIND_LOCKED')) return new GiftKindLockedError()
  if (msg.includes('GIFT_HAS_CONTRIBUTIONS'))
    return new GiftHasContributionsError()
  return null
}

export class SupabaseGiftsRepository implements IGiftsRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async list(): Promise<Gift[]> {
    const { data, error } = await this.client
      .from('gifts_with_totals')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapRow)
  }

  async getById(id: string): Promise<Gift | null> {
    const { data, error } = await this.client
      .from('gifts_with_totals')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }

  async reserve(p: ReserveGiftParams): Promise<ReserveGiftResult> {
    const args = {
      p_gift_id: p.id,
      p_name: p.name,
      p_message: p.message ?? '',
      p_amount: p.amount,
      p_contribution_id: p.contributionId,
    } satisfies ReserveGiftArgs

    const { data, error } = await this.client.rpc('reserve_gift', args)
    if (error) throw mapSentinel(error.message ?? '') ?? error

    const row = Array.isArray(data) ? data[0] : data
    if (!row) throw new GiftNotFoundError()

    return {
      gift: mapRow(row as GiftTotalsRow),
      contributionId: p.contributionId,
    }
  }

  async reserveConfirmed(
    p: ReserveGiftConfirmedParams
  ): Promise<ReserveGiftResult> {
    const args = {
      p_gift_id: p.id,
      p_name: p.name,
      p_message: p.message ?? '',
      p_amount: p.amount,
      p_contribution_id: p.contributionId,
      p_payment_method: p.paymentMethod,
      p_payment_provider: p.paymentProvider,
      p_mp_payment_id:
        p.paymentProvider === 'mercado_pago' ? p.mpPaymentId : null,
      p_pagbank_payment_id:
        p.paymentProvider === 'pagbank' ? p.pagbankPaymentId : null,
    } satisfies ReserveGiftPaidArgs

    const { data, error } = await this.client.rpc('reserve_gift_paid', args)
    if (error) throw mapSentinel(error.message ?? '') ?? error

    const row = Array.isArray(data) ? data[0] : data
    if (!row) throw new GiftNotFoundError()

    return {
      gift: mapRow(row as GiftTotalsRow),
      contributionId: p.contributionId,
    }
  }

  // Writes go to the table, reads come back through the view: an insert cannot
  // return view columns, and getById is a cheap indexed lookup.
  async create(data: CreateGiftInput): Promise<Gift> {
    const isFixed = data.kind === 'fixed_item'

    const payload = {
      name: data.name,
      description: data.description ?? null,
      category: data.category ?? 'other',
      image_path: data.imagePath ?? null,
      kind: data.kind,
      price: isFixed ? (data.price ?? null) : null,
      min_amount: isFixed ? null : (data.minAmount ?? null),
      suggested_amounts: isFixed ? [] : data.suggestedAmounts,
      goal_amount: data.kind === 'fund' ? (data.goalAmount ?? null) : null,
    } satisfies GiftInsert

    const { data: row, error } = await this.client
      .from('gifts')
      .insert(payload)
      .select('id')
      .single()
    if (error) throw mapSentinel(error.message ?? '') ?? error

    const created = await this.getById(row.id)
    if (!created) throw new GiftNotFoundError()
    return created
  }

  async update(data: UpdateGiftInput): Promise<Gift> {
    const { id, ...rest } = data

    const payload: GiftUpdate = {
      ...(rest.name !== undefined && { name: rest.name }),
      ...(rest.description !== undefined && {
        description: rest.description ?? null,
      }),
      ...(rest.category !== undefined && { category: rest.category }),
      ...(rest.imagePath !== undefined && {
        image_path: rest.imagePath ?? null,
      }),
    }

    // The dialog is uncontrolled, so unmounted inputs never reach FormData.
    // Switching fixed_item -> fund would otherwise leave the old `price` in
    // place and trip gifts_kind_valid. When `kind` is present it is
    // authoritative: derive all four amount columns from it.
    if (rest.kind !== undefined) {
      const isFixed = rest.kind === 'fixed_item'
      payload.kind = rest.kind
      payload.price = isFixed ? (rest.price ?? null) : null
      payload.min_amount = isFixed ? null : (rest.minAmount ?? null)
      payload.suggested_amounts = isFixed ? [] : (rest.suggestedAmounts ?? [])
      payload.goal_amount =
        rest.kind === 'fund' ? (rest.goalAmount ?? null) : null
    }

    const { error } = await this.client
      .from('gifts')
      .update(payload)
      .eq('id', id)
    if (error) throw mapSentinel(error.message ?? '') ?? error

    const updated = await this.getById(id)
    if (!updated) throw new GiftNotFoundError()
    return updated
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('gifts').delete().eq('id', id)
    if (error) throw mapSentinel(error.message ?? '') ?? error
  }
}
