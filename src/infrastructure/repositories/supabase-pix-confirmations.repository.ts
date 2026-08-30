import type { IPixConfirmationsRepository } from '@/src/application/repositories/pix-confirmations.repository.interface'
import type {
  PixConfirmation,
  PixConfirmationInput,
} from '@/src/entities/models/pix'
import type {
  PixConfirmationInsert,
  PixConfirmationRow,
  PixConfirmationUpdate,
} from '@/src/infrastructure/supabase/db-types'
import type { TypedSupabaseClient } from '@/src/infrastructure/supabase/types'

const mapRow = (r: PixConfirmationRow): PixConfirmation => ({
  id: r.id,
  giftId: r.gift_id,
  guestName: r.guest_name,
  amount: Number(r.amount),
  confirmed: r.confirmed ?? false,
  paymentMethod:
    (r.payment_method as PixConfirmation['paymentMethod']) ?? 'pix',
  mpPaymentId: r.mp_payment_id ?? null,
  createdAt: new Date(r.created_at ?? Date.now()),
})

export class SupabasePixConfirmationsRepository implements IPixConfirmationsRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async list(): Promise<PixConfirmation[]> {
    const { data, error } = await this.client
      .from('pix_confirmations')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapRow)
  }

  async listByGiftId(giftId: string): Promise<PixConfirmation[]> {
    const { data, error } = await this.client
      .from('pix_confirmations')
      .select('*')
      .eq('gift_id', giftId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapRow)
  }

  async create(
    input: PixConfirmationInput & {
      confirmed?: boolean
      paymentMethod?: 'pix' | 'card'
      mpPaymentId?: string
    }
  ): Promise<PixConfirmation> {
    const payload = {
      gift_id: input.giftId ?? null,
      guest_name: input.guestName,
      amount: input.amount,
      confirmed: input.confirmed ?? false,
      payment_method: input.paymentMethod ?? 'pix',
      mp_payment_id: input.mpPaymentId ?? null,
    } satisfies PixConfirmationInsert

    const { data, error } = await this.client
      .from('pix_confirmations')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return mapRow(data)
  }

  async findByMpPaymentId(
    mpPaymentId: string
  ): Promise<PixConfirmation | null> {
    const { data, error } = await this.client
      .from('pix_confirmations')
      .select('*')
      .eq('mp_payment_id', mpPaymentId)
      .maybeSingle()
    if (error) throw error
    return data ? mapRow(data) : null
  }

  async update(
    id: string,
    patch: Partial<{ confirmed: boolean }>
  ): Promise<PixConfirmation> {
    const payload: PixConfirmationUpdate = {
      ...(patch.confirmed !== undefined && { confirmed: patch.confirmed }),
    }

    const { data, error } = await this.client
      .from('pix_confirmations')
      .update(payload)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return mapRow(data)
  }

  async deleteByGiftId(giftId: string): Promise<void> {
    const { error } = await this.client
      .from('pix_confirmations')
      .delete()
      .eq('gift_id', giftId)
    if (error) throw error
  }
}
