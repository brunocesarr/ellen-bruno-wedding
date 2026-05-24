import 'server-only'

import { SupabaseSiteImagesRepository } from '@/src/infrastructure/repositories/supabase-site-images.repository'
import { SupabaseStorageRepository } from '@/src/infrastructure/repositories/supabase-storage.repository'
import { createSupabasePublicServerClient } from '@/src/infrastructure/supabase/public'

export function getPublicContainer() {
  const supabase = createSupabasePublicServerClient()

  return {
    siteImagesRepo: new SupabaseSiteImagesRepository(supabase),
    storageRepo: new SupabaseStorageRepository(supabase),
  }
}

export type PublicContainer = ReturnType<typeof getPublicContainer>
