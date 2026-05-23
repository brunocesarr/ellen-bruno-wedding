import type { IRsvpRepository } from '@/src/application/repositories/rsvp.repository.interface'
import type { CreateRsvpInput, Rsvp } from '@/src/entities/models/rsvp'
import type { Database } from '@/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

const mapRow = (r: any): Rsvp => ({
  id: r.id,
  fullName: r.full_name,
  email: r.email,
  phone: r.phone,
  attending: r.attending,
  companions: r.companions,
  dietaryRestrictions: r.dietary_restrictions,
  message: r.message,
  createdAt: new Date(r.created_at),
})

export class SupabaseRsvpRepository implements IRsvpRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async create(input: CreateRsvpInput): Promise<Rsvp> {
    const { data, error } = await this.client
      .from('rsvp')
      .insert({
        full_name: input.fullName,
        email: input.email || null,
        phone: input.phone || null,
        attending: input.attending,
        companions: input.companions,
        dietary_restrictions: input.dietaryRestrictions || null,
        message: input.message || null,
      })
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
    return data.map(mapRow)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('rsvp').delete().eq('id', id)
    if (error) throw error
  }
}
