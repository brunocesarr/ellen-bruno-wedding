import 'server-only'

import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import type {
  CreateGuestInput,
  Guest,
  GuestStatus,
  UpdateGuestInput,
} from '@/src/entities/models/guest'
import { GuestRow, GuestUpdate } from '@/src/infrastructure/supabase/db-types'
import type { TypedSupabaseClient } from '@/src/infrastructure/supabase/types'

type Row = {
  id: string
  first_name: string
  last_name: string
  status: GuestStatus
  invite_token: string
  party_id: string
  notes: string | null
  confirmed_at: string | null
  created_at: string
  updated_at: string
}

const mapRow = (row: GuestRow): Guest => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  status: row.status as GuestStatus,
  inviteToken: row.invite_token,
  partyId: row.party_id,
  notes: row.notes,
  confirmedAt: row.confirmed_at ? new Date(row.confirmed_at) : null,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
})

export class SupabaseGuestsRepository implements IGuestsRepository {
  constructor(private readonly supabase: TypedSupabaseClient) {}

  async list(): Promise<Guest[]> {
    const { data, error } = await this.supabase
      .from('guests')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return (data as Row[]).map(mapRow)
  }

  async findById(id: string): Promise<Guest | null> {
    const { data, error } = await this.supabase
      .from('guests')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? mapRow(data as Row) : null
  }

  async findByInviteToken(token: string): Promise<Guest | null> {
    const { data, error } = await this.supabase
      .from('guests')
      .select('*')
      .eq('invite_token', token)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? mapRow(data as Row) : null
  }

  async listByPartyId(partyId: string): Promise<Guest[]> {
    const { data, error } = await this.supabase
      .from('guests')
      .select('*')
      .eq('party_id', partyId)
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return (data as Row[]).map(mapRow)
  }

  async create(input: CreateGuestInput): Promise<Guest> {
    const { data, error } = await this.supabase
      .from('guests')
      .insert({
        first_name: input.firstName,
        last_name: input.lastName,
        status: input.status,
        notes: input.notes ?? null,
        ...(input.partyId ? { party_id: input.partyId } : {}),
      })
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return mapRow(data as Row)
  }

  async update(input: UpdateGuestInput): Promise<Guest> {
    const { id, ...rest } = input

    const patch: GuestUpdate = {}
    if (rest.firstName !== undefined) patch.first_name = rest.firstName
    if (rest.lastName !== undefined) patch.last_name = rest.lastName
    if (rest.status !== undefined) patch.status = rest.status
    if (rest.notes !== undefined) patch.notes = rest.notes
    if (rest.partyId !== undefined) patch.party_id = rest.partyId

    const { data, error } = await this.supabase
      .from('guests')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return mapRow(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('guests').delete().eq('id', id)
    if (error) throw new Error(error.message)
  }

  async setStatuses(
    updates: { id: string; status: GuestStatus }[]
  ): Promise<Guest[]> {
    const { data, error } = await this.supabase.rpc('set_guest_statuses', {
      p_updates: updates,
    })

    if (error) throw new Error(error.message)
    return (data as GuestRow[]).map(mapRow)
  }
}
