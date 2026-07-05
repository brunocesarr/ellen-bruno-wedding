import type { IRsvpRepository } from '@/src/application/repositories/rsvp.repository.interface'
import type { CreateRsvpInput, Rsvp } from '@/src/entities/models/rsvp'
import type {
  RsvpInsert,
  RsvpRow,
} from '@/src/infrastructure/supabase/db-types'
import type { TypedSupabaseClient } from '@/src/infrastructure/supabase/types'

const mapRow = (r: RsvpRow): Rsvp => ({
  id: r.id,
  fullName: r.full_name,
  email: r.email,
  phone: r.phone,
  attending: r.attending,
  companions: r.companions ?? 0,
  dietaryRestrictions: r.dietary_restrictions,
  message: r.message,
  createdAt: new Date(r.created_at ?? Date.now()),
})

export class SupabaseRsvpRepository implements IRsvpRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async create(input: CreateRsvpInput): Promise<Rsvp> {
    const payload = {
      full_name: input.fullName,
      email: input.email || null,
      phone: input.phone || null,
      attending: input.attending,
      companions: input.companions,
      dietary_restrictions: input.dietaryRestrictions || null,
      message: input.message || null,
    } satisfies RsvpInsert

    const { data, error } = await this.client
      .from('rsvp')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return mapRow(data)
  }

  async list(): Promise<Rsvp[]> {
    const { data, error } = await this.client
      .from('rsvp')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapRow)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('rsvp').delete().eq('id', id)
    if (error) throw error
  }
}
