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
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

const mapRow = (r: any): Gift => ({
  id: r.id,
  name: r.name,
  description: r.description,
  price: Number(r.price),
  imagePath: r.image_path,
  isReserved: r.is_reserved,
  reservedByName: r.reserved_by_name,
  reservedByEmail: r.reserved_by_email,
  reservedAt: r.reserved_at ? new Date(r.reserved_at) : null,
})

export class SupabaseGiftsRepository implements IGiftsRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async list(): Promise<Gift[]> {
    const { data, error } = await this.client
      .from('gifts')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data.map(mapRow)
  }

  async getById(id: string) {
    const { data, error } = await this.client
      .from('gifts')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }

  async reserve(id: string, name: string, email: string) {
    const { data, error } = await this.client.rpc('reserve_gift', {
      p_gift_id: id,
      p_name: name,
      p_email: email,
    })
    if (error?.message?.includes('GIFT_ALREADY_RESERVED'))
      throw new GiftAlreadyReservedError()
    if (error) throw error
    if (!data) throw new GiftNotFoundError()
    return mapRow(Array.isArray(data) ? data[0] : data)
  }

  async create(data: CreateGiftInput) {
    const { data: row, error } = await this.client
      .from('gifts')
      .insert({
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        image_path: data.imagePath ?? null,
      })
      .select()
      .single()
    if (error) throw error
    return mapRow(row)
  }

  async update(data: UpdateGiftInput) {
    const { data: row, error } = await this.client
      .from('gifts')
      .update({
        name: data.name,
        description: data.description,
        price: data.price,
        image_path: data.imagePath,
      })
      .eq('id', data.id)
      .select()
      .single()
    if (error) throw error
    return mapRow(row)
  }

  async delete(id: string) {
    const { error } = await this.client.from('gifts').delete().eq('id', id)
    if (error) throw error
  }
}
