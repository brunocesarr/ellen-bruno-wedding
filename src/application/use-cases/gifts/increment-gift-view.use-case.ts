import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import { z } from 'zod'

const GiftIdSchema = z.string().uuid()

/**
 * Best-effort view counter, scheduled with `after()` so it never sits in the
 * render path. Swallows everything: an analytics blip must not break a
 * guest's gift page.
 */
export function incrementGiftViewUseCase(deps: {
  giftsRepo: IGiftsRepository
}) {
  return async (raw: unknown): Promise<void> => {
    const parsed = GiftIdSchema.safeParse(raw)
    if (!parsed.success) return

    try {
      await deps.giftsRepo.incrementView(parsed.data)
    } catch (error) {
      console.error('[incrementGiftView] view counter failed', error)
    }
  }
}
