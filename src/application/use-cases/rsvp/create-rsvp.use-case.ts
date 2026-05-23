import type { IRsvpRepository } from '@/src/application/repositories/rsvp.repository.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { CreateRsvpInputSchema, type Rsvp } from '@/src/entities/models/rsvp'

export function createRsvpUseCase(deps: { rsvpRepo: IRsvpRepository }) {
  return async (raw: unknown): Promise<Rsvp> => {
    const result = CreateRsvpInputSchema.safeParse(raw)
    if (!result.success) throw new ValidationError(result.error.flatten())
    return deps.rsvpRepo.create(result.data)
  }
}
