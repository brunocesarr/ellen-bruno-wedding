import 'server-only'

import { SupabaseGiftsRepository } from '@/src/infrastructure/repositories/supabase-gifts.repository'
import { SupabaseGuestsRepository } from '@/src/infrastructure/repositories/supabase-guests.repository'
import { SupabasePixConfirmationsRepository } from '@/src/infrastructure/repositories/supabase-pix-confirmations.repository'
import { SupabaseRsvpRepository } from '@/src/infrastructure/repositories/supabase-rsvp.repository'
import { SupabaseSiteImagesRepository } from '@/src/infrastructure/repositories/supabase-site-images.repository'
import { SupabaseStorageRepository } from '@/src/infrastructure/repositories/supabase-storage.repository'
import { PixUtilsService } from '@/src/infrastructure/services/pix-utils.service'
import { SupabaseAuthService } from '@/src/infrastructure/services/supabase-auth.service'
import { createSupabaseServerClient } from '@/src/infrastructure/supabase/server'
import { cache } from 'react'

/**
 * Builds the authenticated dependency container. Wrapped in React `cache()` so
 * the Supabase server client and repositories are instantiated once per request,
 * even when several controllers resolve the container during the same render.
 */
export const getContainer = cache(async () => {
  const supabase = await createSupabaseServerClient()
  return {
    rsvpRepo: new SupabaseRsvpRepository(supabase),
    giftsRepo: new SupabaseGiftsRepository(supabase),
    pixRepo: new SupabasePixConfirmationsRepository(supabase),
    storageRepo: new SupabaseStorageRepository(supabase),
    siteImagesRepo: new SupabaseSiteImagesRepository(supabase),
    authService: new SupabaseAuthService(supabase),
    pixService: new PixUtilsService(),
    guestsRepo: new SupabaseGuestsRepository(supabase),
  }
})
export type Container = Awaited<ReturnType<typeof getContainer>>
