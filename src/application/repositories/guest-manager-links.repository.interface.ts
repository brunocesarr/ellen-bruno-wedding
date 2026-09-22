import type {
  CreateGuestManagerLinkInput,
  GuestManagerLink,
} from '@/src/entities/models/guest-manager-link'

export interface IGuestManagerLinksRepository {
  /**
   * Public resolver path. Only ever returns a link that is active AND unexpired
   * — expiry is enforced here, not left to the caller.
   */
  findUsableByToken(token: string): Promise<GuestManagerLink | null>
  /** Admin listing: active links first, newest first. */
  list(): Promise<GuestManagerLink[]>
  create(input: CreateGuestManagerLinkInput): Promise<GuestManagerLink>
  /** Deactivates one link. Returns false if it was already inactive/unknown. */
  revoke(id: string): Promise<boolean>
  /** Deactivates every active link. Returns how many were revoked. */
  revokeAllActive(): Promise<number>
  /** Fire-and-forget usage counter. Must never throw into a render path. */
  touch(token: string): Promise<void>
}
