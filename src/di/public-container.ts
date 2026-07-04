import 'server-only'

import { SupabaseGuestsRepository } from '@/src/infrastructure/repositories/supabase-guests.repository'
import { SupabaseSiteImagesRepository } from '@/src/infrastructure/repositories/supabase-site-images.repository'
import { SupabaseStorageRepository } from '@/src/infrastructure/repositories/supabase-storage.repository'
import { createSupabaseAdminClient } from '@/src/infrastructure/supabase/admin'
import { createSupabasePublicServerClient } from '@/src/infrastructure/supabase/public'
import { cache } from 'react'

/**
 * Dependency container for unauthenticated public routes. Cached per request.
 *
 * `guestsRepo` deliberately uses the service-role admin client: the public
 * invite flow validates the invite token on the server *before* exposing any
 * guest data, so RLS is bypassed intentionally at this trusted boundary.
 */
export const getPublicContainer = cache(() => {
  const supabase = createSupabasePublicServerClient()
  const adminClient = createSupabaseAdminClient()

  return {
    siteImagesRepo: new SupabaseSiteImagesRepository(supabase),
    storageRepo: new SupabaseStorageRepository(supabase),
    guestsRepo: new SupabaseGuestsRepository(adminClient),
  }
})

export type PublicContainer = ReturnType<typeof getPublicContainer>
