import type {
  CreateInviteLinkInput,
  InviteLink,
} from '@/src/entities/models/invite-link'

export interface IInviteLinksRepository {
  /** Public resolver path: only ever returns an ACTIVE link. */
  findActiveByToken(token: string): Promise<InviteLink | null>
  /** Most recently created active link, or null if none exists. */
  findActive(): Promise<InviteLink | null>
  list(): Promise<InviteLink[]>
  create(input: CreateInviteLinkInput): Promise<InviteLink>
  /** Deactivates every currently active link. Returns how many were revoked. */
  revokeAllActive(): Promise<number>
  /** Fire-and-forget visit counter. Must never throw into a render path. */
  touch(token: string): Promise<void>
}
