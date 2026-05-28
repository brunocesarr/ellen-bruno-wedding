import 'server-only'

import { SupabaseGuestsRepository } from '@/src/infrastructure/repositories/supabase-guests.repository'
import { SupabaseSiteImagesRepository } from '@/src/infrastructure/repositories/supabase-site-images.repository'
import { SupabaseStorageRepository } from '@/src/infrastructure/repositories/supabase-storage.repository'
import { createSupabaseAdminClient } from '@/src/infrastructure/supabase/admin'
import { createSupabasePublicServerClient } from '@/src/infrastructure/supabase/public'

export function getPublicContainer() {
  const supabase = createSupabasePublicServerClient()
  const adminClient = createSupabaseAdminClient()

  return {
    siteImagesRepo: new SupabaseSiteImagesRepository(supabase),
    storageRepo: new SupabaseStorageRepository(supabase),
    guestsRepo: new SupabaseGuestsRepository(adminClient),
  }
}

export type PublicContainer = ReturnType<typeof getPublicContainer>
