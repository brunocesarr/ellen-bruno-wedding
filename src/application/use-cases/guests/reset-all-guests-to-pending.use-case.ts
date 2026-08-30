import type { IGuestsRepository } from '@/src/application/repositories/guests.repository.interface'
import type { Guest } from '@/src/entities/models/guest'

/**
 * Bulk-resets every guest to 'pending'. Routes through the same
 * set_guest_statuses RPC as confirmAttendanceUseCase, whose SQL clears
 * confirmed_at to null whenever status isn't 'going' — so this also wipes the
 * "when did they confirm" history, not just the status label.
 */
export function resetAllGuestsToPendingUseCase(deps: {
  guestsRepo: IGuestsRepository
}) {
  return async (): Promise<Guest[]> => {
    const guests = await deps.guestsRepo.list()
    if (guests.length === 0) return []

    return deps.guestsRepo.setStatuses(
      guests.map((g) => ({ id: g.id, status: 'pending' as const }))
    )
  }
}
