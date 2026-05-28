'use server'

import { GiftCategory } from '@/src/entities/models/gift'
import { createSupabaseServerClient } from '@/src/infrastructure/supabase/server'
import { revalidatePath } from 'next/cache'

export type GiftStatus = 'pending' | 'reserved' | 'thanked'

export type GiftItem = {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number | null
  imageUrl: string | null
  status: GiftStatus
  reservedBy: string | null
  reservedByEmail: string | null
  reservedAt: string | null
  reservedMessage: string | null
}

type GiftRow = {
  id: string
  name: string
  description: string | null
  category: string | null
  price: number | string | null
  image_path: string | null
  is_reserved: boolean | null
  reserved_by_name: string | null
  reserved_by_email: string | null
  reserved_at: string | null
  reserved_message: string | null
  pix_confirmations: { confirmed: boolean | null }[] | null
}

function deriveStatus(row: GiftRow): GiftStatus {
  if (!row.is_reserved) return 'pending'
  const hasConfirmedPix =
    row.pix_confirmations?.some((p) => p.confirmed) ?? false
  return hasConfirmedPix ? 'thanked' : 'reserved'
}

function mapGift(row: GiftRow): GiftItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    price: row.price !== null ? Number(row.price) : null,
    imageUrl: row.image_path,
    status: deriveStatus(row),
    reservedBy: row.reserved_by_name,
    reservedByEmail: row.reserved_by_email,
    reservedAt: row.reserved_at,
    reservedMessage: row.reserved_message,
  }
}

export async function listGifts(): Promise<GiftItem[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('gifts')
    .select(
      `
     id, name, description, category, price, image_path,
     is_reserved, reserved_by_name, reserved_by_email,
     reserved_at, reserved_message,
     pix_confirmations(confirmed)
   `
    )
    .order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as unknown as GiftRow[]).map(mapGift)
}

export async function upsertGift(input: {
  id?: string
  name: string
  description?: string
  category?: GiftCategory
  price?: number
  imageUrl?: string
}) {
  const supabase = await createSupabaseServerClient()
  const payload = {
    name: input.name,
    description: input.description,
    category: input.category,
    price: input.price ?? 0,
    image_path: input.imageUrl,
  }
  const q = input.id
    ? supabase.from('gifts').update(payload).eq('id', input.id)
    : supabase.from('gifts').insert(payload)
  const { error } = await q
  if (error) throw error
  revalidatePath('/admin/presentes')
  revalidatePath('/admin')
}

export async function deleteGift(id: string) {
  const supabase = await createSupabaseServerClient()
  await supabase.from('pix_confirmations').delete().eq('gift_id', id)
  const { error } = await supabase.from('gifts').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/admin/presentes')
}
