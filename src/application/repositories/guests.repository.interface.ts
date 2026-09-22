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
  findByName(fullName: string): Promise<Guest | null>

  findByPartyInviteToken(token: string): Promise<Guest | null>
  listByPartyId(partyId: string): Promise<Guest[]>
  create(input: CreateGuestInput): Promise<Guest>
  update(input: UpdateGuestInput): Promise<Guest>
  delete(id: string): Promise<void>

  /**
   * The guest-manager link's only write. Narrowed to the three columns a
   * manager may touch, so that scope is enforced at the column level instead
   * of resting on validation alone. Never widen it to take an
   * UpdateGuestInput: `notes` and `partyId` are not a manager's to change.
   */
  updateNameAndStatus(input: {
    id: string
    firstName?: string
    lastName?: string
    status?: GuestStatus
  }): Promise<Guest>

  setStatuses(updates: { id: string; status: GuestStatus }[]): Promise<Guest[]>
}
