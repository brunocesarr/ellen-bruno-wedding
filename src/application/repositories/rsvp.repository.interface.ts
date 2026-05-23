import type { CreateRsvpInput, Rsvp } from '@/src/entities/models/rsvp'

export interface IRsvpRepository {
  create(input: CreateRsvpInput): Promise<Rsvp>
  list(): Promise<Rsvp[]>
  delete(id: string): Promise<void>
}
