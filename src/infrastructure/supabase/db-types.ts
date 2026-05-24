import type { Database } from '@/types/database.types'

// ---- Tables ----
export type GiftRow = Database['public']['Tables']['gifts']['Row']
export type GiftInsert = Database['public']['Tables']['gifts']['Insert']
export type GiftUpdate = Database['public']['Tables']['gifts']['Update']

export type RsvpRow = Database['public']['Tables']['rsvp']['Row']
export type RsvpInsert = Database['public']['Tables']['rsvp']['Insert']
export type RsvpUpdate = Database['public']['Tables']['rsvp']['Update']

export type PixConfirmationRow =
  Database['public']['Tables']['pix_confirmations']['Row']
export type PixConfirmationInsert =
  Database['public']['Tables']['pix_confirmations']['Insert']
export type PixConfirmationUpdate =
  Database['public']['Tables']['pix_confirmations']['Update']

// ---- RPCs ----
export type ReserveGiftArgs =
  Database['public']['Functions']['reserve_gift']['Args']
export type ReserveGiftReturn =
  Database['public']['Functions']['reserve_gift']['Returns']

export type SiteImageRow = Database['public']['Tables']['site_images']['Row']
export type SiteImageInsert =
  Database['public']['Tables']['site_images']['Insert']
export type SiteImageUpdate =
  Database['public']['Tables']['site_images']['Update']
