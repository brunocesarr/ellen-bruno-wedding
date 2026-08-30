import 'server-only'

import { SupabaseGuestsRepository } from '@/src/infrastructure/repositories/supabase-guests.repository'
import { SupabaseInviteLinksRepository } from '@/src/infrastructure/repositories/supabase-invite-links.repository'
import { SupabaseRsvpRequestsRepository } from '@/src/infrastructure/repositories/supabase-rsvp-requests.repository'
import { SupabaseSiteImagesRepository } from '@/src/infrastructure/repositories/supabase-site-images.repository'
import { SupabaseStorageRepository } from '@/src/infrastructure/repositories/supabase-storage.repository'
import { createEmailService } from '@/src/infrastructure/services/nodemailer-email.service'
import { createNotificationService } from '@/src/infrastructure/services/telegram-notification.service'
import { createSupabaseAdminClient } from '@/src/infrastructure/supabase/admin'
import { createSupabasePublicServerClient } from '@/src/infrastructure/supabase/public'
import { cache } from 'react'

export const getPublicContainer = cache(() => {
  const supabase = createSupabasePublicServerClient()
  const adminClient = createSupabaseAdminClient()

  return {
    siteImagesRepo: new SupabaseSiteImagesRepository(supabase),
    storageRepo: new SupabaseStorageRepository(supabase),
    guestsRepo: new SupabaseGuestsRepository(adminClient),
    rsvpRequestsRepo: new SupabaseRsvpRequestsRepository(adminClient),
    inviteLinksRepo: new SupabaseInviteLinksRepository(adminClient),
    emailService: createEmailService(),
    notificationService: createNotificationService(),
  }
})

export type PublicContainer = ReturnType<typeof getPublicContainer>
