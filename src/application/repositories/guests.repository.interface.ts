import type {
  CreateGuestInput,
  Guest,
  GuestStatus,
  UpdateGuestInput,
} from '@/src/entities/models/guest'

export interface IGuestsRepository {
  list(): Promise<Guest[]>
  findById(id: string): Promise<Guest | null>
  findByInviteToken(token: string): Promise<Guest | null>
  /** Finds any guest whose party shares this token; used to resolve group invite links. */
  findByPartyInviteToken(token: string): Promise<Guest | null>
  listByPartyId(partyId: string): Promise<Guest[]>
  create(input: CreateGuestInput): Promise<Guest>
  update(input: UpdateGuestInput): Promise<Guest>
  delete(id: string): Promise<void>
  /** Atomically updates the status of several guests inside the same party. */
  setStatuses(updates: { id: string; status: GuestStatus }[]): Promise<Guest[]>
}
