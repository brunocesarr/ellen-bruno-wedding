import 'server-only'

import type { IRsvpRequestsRepository } from '@/src/application/repositories/rsvp-requests.repository.interface'
import {
  DuplicateRsvpRequestError,
  RsvpRequestAlreadyDecidedError,
  RsvpRequestNotFoundError,
} from '@/src/entities/errors/rsvp-requests'
import type {
  CreateRsvpRequestInput,
  RsvpRequest,
  RsvpRequestStatus,
} from '@/src/entities/models/rsvp-request'
import type {
  RsvpRequestInsert,
  RsvpRequestRow,
} from '@/src/infrastructure/supabase/db-types'
import type { TypedSupabaseClient } from '@/src/infrastructure/supabase/types'

/** Postgres unique_violation */
const PG_UNIQUE_VIOLATION = '23505'

const mapRow = (r: RsvpRequestRow): RsvpRequest => ({
  id: r.id,
  fullName: r.full_name,
  email: r.email,
  attending: r.attending,
  message: r.message,
  status: r.status as RsvpRequestStatus,
  guestId: r.guest_id,
  decidedAt: r.decided_at ? new Date(r.decided_at) : null,
  notifiedAt: r.notified_at ? new Date(r.notified_at) : null,
  notifyAttempts: r.notify_attempts,
  notifyError: r.notify_error,
  createdAt: new Date(r.created_at),
  updatedAt: new Date(r.updated_at),
})

export class SupabaseRsvpRequestsRepository implements IRsvpRequestsRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async create(input: CreateRsvpRequestInput): Promise<RsvpRequest> {
    const payload = {
      full_name: input.fullName,
      email: input.email.trim().toLowerCase(),
      attending: input.attending,
      message: input.message ?? null,
    } satisfies RsvpRequestInsert

    const { data, error } = await this.client
      .from('rsvp_requests')
      .insert(payload)
      .select('*')
      .single()

    // Race-safe backstop for rsvp_requests_pending_email_idx.
    if (error?.code === PG_UNIQUE_VIOLATION) {
      throw new DuplicateRsvpRequestError()
    }
    if (error) throw new Error(error.message)
    return mapRow(data)
  }

  async list(status?: RsvpRequestStatus): Promise<RsvpRequest[]> {
    let query = this.client
      .from('rsvp_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw new Error(error.message)
    return (data ?? []).map(mapRow)
  }

  async findById(id: string): Promise<RsvpRequest | null> {
    const { data, error } = await this.client
      .from('rsvp_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? mapRow(data) : null
  }

  async findPendingByEmail(email: string): Promise<RsvpRequest | null> {
    const { data, error } = await this.client
      .from('rsvp_requests')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .eq('status', 'pending')
      .maybeSingle()
    if (error) throw new Error(error.message)
    return data ? mapRow(data) : null
  }

  async countPending(): Promise<number> {
    const { count, error } = await this.client
      .from('rsvp_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    if (error) throw new Error(error.message)
    return count ?? 0
  }

  async countUnnotified(): Promise<number> {
    const { count, error } = await this.client
      .from('rsvp_requests')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'pending')
      .is('notified_at', null)
    if (error) throw new Error(error.message)
    return count ?? 0
  }

  async approve(id: string): Promise<RsvpRequest> {
    const { data, error } = await this.client.rpc('approve_rsvp_request', {
      p_request_id: id,
    })

    if (error) {
      if (error.message.includes('RSVP_REQUEST_NOT_FOUND'))
        throw new RsvpRequestNotFoundError()
      if (error.message.includes('RSVP_REQUEST_ALREADY_DECIDED'))
        throw new RsvpRequestAlreadyDecidedError()
      throw new Error(error.message)
    }

    return mapRow(data as RsvpRequestRow)
  }

  async reject(id: string): Promise<RsvpRequest> {
    const { data, error } = await this.client
      .from('rsvp_requests')
      .update({ status: 'rejected', decided_at: new Date().toISOString() })
      .eq('id', id)
      .eq('status', 'pending')
      .select('*')
      .maybeSingle()

    if (error) throw new Error(error.message)
    // Zero rows matched => decided between our read and our write.
    if (!data) throw new RsvpRequestAlreadyDecidedError()
    return mapRow(data)
  }

  async recordNotification(
    id: string,
    ok: boolean,
    error?: string | null
  ): Promise<RsvpRequest> {
    const { data, error: rpcError } = await this.client.rpc(
      'record_rsvp_notification',
      {
        p_request_id: id,
        p_ok: ok,
        p_error: error ?? undefined,
      }
    )

    if (rpcError) {
      if (rpcError.message.includes('RSVP_REQUEST_NOT_FOUND'))
        throw new RsvpRequestNotFoundError()
      throw new Error(rpcError.message)
    }

    return mapRow(data as RsvpRequestRow)
  }

  async deletePending(id: string): Promise<void> {
    // The .eq('status','pending') guard makes this race-safe.
    const { data, error } = await this.client
      .from('rsvp_requests')
      .delete()
      .eq('id', id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()

    if (error) throw new Error(error.message)
    if (!data) throw new RsvpRequestAlreadyDecidedError()
  }

  async deleteDecided(): Promise<number> {
    const { data, error } = await this.client
      .from('rsvp_requests')
      .delete()
      .neq('status', 'pending')
      .select('id')

    if (error) throw new Error(error.message)
    return data?.length ?? 0
  }
}
