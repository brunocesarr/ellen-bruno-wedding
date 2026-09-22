import 'server-only'

import type { IGuestManagerLinksRepository } from '@/src/application/repositories/guest-manager-links.repository.interface'
import type {
  CreateGuestManagerLinkInput,
  GuestManagerLink,
} from '@/src/entities/models/guest-manager-link'
import type {
  GuestManagerLinkInsert,
  GuestManagerLinkRow,
} from '@/src/infrastructure/supabase/db-types'
import type { TypedSupabaseClient } from '@/src/infrastructure/supabase/types'

/**
 * `guest_manager_links` is absent from the generated Database type until
 * `pnpm db:push && pnpm db:types` runs. The cast is confined to this one helper
 * so every call site below stays checked against the hand-written row types;
 * delete it (and the hand-written types in db-types.ts) after regenerating.
 */
const untyped = (client: TypedSupabaseClient) =>
  (client as any).from('guest_manager_links')

const mapRow = (r: GuestManagerLinkRow): GuestManagerLink => ({
  id: r.id,
  token: r.token,
  label: r.label,
  isActive: r.is_active,
  expiresAt: r.expires_at ? new Date(r.expires_at) : null,
  useCount: r.use_count,
  lastUsedAt: r.last_used_at ? new Date(r.last_used_at) : null,
  revokedAt: r.revoked_at ? new Date(r.revoked_at) : null,
  createdAt: new Date(r.created_at),
  updatedAt: new Date(r.updated_at),
})

export class SupabaseGuestManagerLinksRepository implements IGuestManagerLinksRepository {
  constructor(private readonly client: TypedSupabaseClient) {}

  async findUsableByToken(token: string): Promise<GuestManagerLink | null> {
    const { data, error } = await untyped(this.client)
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return null

    const link = mapRow(data as GuestManagerLinkRow)
    // Expiry is enforced on this path, not left to callers: every consumer of
    // a manager token goes through findUsableByToken, so an expired link is
    // indistinguishable from a revoked one everywhere.
    if (link.expiresAt && link.expiresAt.getTime() <= Date.now()) return null
    return link
  }

  async list(): Promise<GuestManagerLink[]> {
    const { data, error } = await untyped(this.client)
      .select('*')
      .order('is_active', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) throw new Error(error.message)
    return ((data ?? []) as GuestManagerLinkRow[]).map(mapRow)
  }

  async create(input: CreateGuestManagerLinkInput): Promise<GuestManagerLink> {
    // token + id come from column defaults.
    const payload: GuestManagerLinkInsert = {
      ...(input.label ? { label: input.label } : {}),
      ...(input.expiresInDays
        ? {
            expires_at: new Date(
              Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000
            ).toISOString(),
          }
        : {}),
    }

    const { data, error } = await untyped(this.client)
      .insert(payload)
      .select('*')
      .single()
    if (error) throw new Error(error.message)
    return mapRow(data as GuestManagerLinkRow)
  }

  async revoke(id: string): Promise<boolean> {
    const { data, error } = await untyped(this.client)
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq('id', id)
      .eq('is_active', true)
      .select('id')
    if (error) throw new Error(error.message)
    return ((data ?? []) as { id: string }[]).length > 0
  }

  async revokeAllActive(): Promise<number> {
    const { data, error } = await untyped(this.client)
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq('is_active', true)
      .select('id')
    if (error) throw new Error(error.message)
    return ((data ?? []) as { id: string }[]).length
  }

  async touch(token: string): Promise<void> {
    const { error } = await (this.client as any).rpc(
      'touch_guest_manager_link',
      { p_token: token }
    )
    if (error) throw new Error(error.message)
  }
}
