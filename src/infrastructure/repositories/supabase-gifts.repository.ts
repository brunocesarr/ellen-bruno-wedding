import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import {
  GiftAlreadyReservedError,
  GiftNotFoundError,
} from '@/src/entities/errors/gifts'
import type {
  CreateGiftInput,
  Gift,
  UpdateGiftInput,
} from '@/src/entities/models/gift'
import type {
  GiftInsert,
  GiftRow,
  GiftUpdate,
  ReserveGiftArgs,
  ReserveGiftReturn,
} from '@/src/infrastructure/supabase/db-types'
import type { TypedSupabaseClient } from '@/src/infrastructure/supabase/types'

const mapRow = (r: GiftRow): Gift => ({
  id: r.id,
  name: r.name,
  description: r.description,
  price: Number(r.price),
  imagePath: r.image_path,
  isReserved: r.is_reserved ?? false,
  reservedByName: r.reserved_by_name,
  reservedByEmail: r.reserved_by_email,
  reservedMessage: r.reserved_message,
  reservedAt: r.reserved_at ? new Date(r.reserved_at) : null,
  category: (r.category ?? 'other') as Gift['category'],
})

export class SupabaseGiftsRepository implements IGiftsRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async list(): Promise<Gift[]> {
    const { data, error } = await this.client
      .from('gifts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapRow)
  }

  async getById(id: string): Promise<Gift | null> {
    const { data, error } = await this.client
      .from('gifts')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }

  async reserve(id: string, name: string, message: string): Promise<Gift> {
    const args = {
      p_gift_id: id,
      p_name: name,
      p_message: message ?? null,
    } satisfies ReserveGiftArgs

    const { data, error } = await this.client.rpc('reserve_gift', args)

    if (error?.message?.includes('GIFT_ALREADY_RESERVED')) {
      throw new GiftAlreadyReservedError()
    }
    if (error) throw error
    if (!data) throw new GiftNotFoundError()

    const row = (
      Array.isArray(data) ? data[0] : data
    ) as ReserveGiftReturn extends (infer U)[] ? U : ReserveGiftReturn
    return mapRow(row as GiftRow)
  }

  async create(data: CreateGiftInput): Promise<Gift> {
    const payload = {
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      image_path: data.imagePath ?? null,
    } satisfies GiftInsert // 👈 the magic

    const { data: row, error } = await this.client
      .from('gifts')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return mapRow(row)
  }

  async update(data: UpdateGiftInput): Promise<Gift> {
    const { id, ...rest } = data

    const payload: GiftUpdate = {
      ...(rest.name !== undefined && { name: rest.name }),
      ...(rest.description !== undefined && {
        description: rest.description ?? null,
      }),
      ...(rest.price !== undefined && { price: rest.price }),
      ...(rest.imagePath !== undefined && {
        image_path: rest.imagePath ?? null,
      }),
    } // 👈 typed object, not satisfies

    const { data: row, error } = await this.client
      .from('gifts')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return mapRow(row)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('gifts').delete().eq('id', id)
    if (error) throw error
  }
}
