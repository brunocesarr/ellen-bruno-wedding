import { SupabaseGiftsRepository } from '@/src/infrastructure/repositories/supabase-gifts.repository'
import { SupabasePixConfirmationsRepository } from '@/src/infrastructure/repositories/supabase-pix-confirmations.repository'
import { SupabaseRsvpRepository } from '@/src/infrastructure/repositories/supabase-rsvp.repository'
import { SupabaseStorageRepository } from '@/src/infrastructure/repositories/supabase-storage.repository'
import { PixUtilsService } from '@/src/infrastructure/services/pix-utils.service'
import { SupabaseAuthService } from '@/src/infrastructure/services/supabase-auth.service'
import { createSupabaseServerClient } from '@/src/infrastructure/supabase/server'

export async function getContainer() {
  const supabase = await createSupabaseServerClient()
  return {
    rsvpRepo: new SupabaseRsvpRepository(supabase),
    giftsRepo: new SupabaseGiftsRepository(supabase),
    pixRepo: new SupabasePixConfirmationsRepository(supabase),
    storageRepo: new SupabaseStorageRepository(supabase),
    authService: new SupabaseAuthService(supabase),
    pixService: new PixUtilsService(),
  }
}
export type Container = Awaited<ReturnType<typeof getContainer>>
