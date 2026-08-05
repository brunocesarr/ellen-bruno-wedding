import type {
  CreateRsvpRequestInput,
  RsvpRequest,
  RsvpRequestStatus,
} from '@/src/entities/models/rsvp-request'

export interface IRsvpRequestsRepository {
  create(input: CreateRsvpRequestInput): Promise<RsvpRequest>
  list(status?: RsvpRequestStatus): Promise<RsvpRequest[]>
  findById(id: string): Promise<RsvpRequest | null>
  findPendingByEmail(email: string): Promise<RsvpRequest | null>
  /** Head-only count for the sidebar badge — never pulls PII rows. */
  countPending(): Promise<number>
  /** Atomic: find-or-create the guest and stamp the request as approved. */
  approve(id: string): Promise<RsvpRequest>
  reject(id: string): Promise<RsvpRequest>
  /**
   * Deletes ONLY while still pending. Decided requests are an audit trail and
   * must not be removable. Enforced in SQL, not just in the use case.
   */
  deletePending(id: string): Promise<void>
}
