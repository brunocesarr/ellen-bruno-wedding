import type { Database } from '@/types/database.types'

export type GiftRow = Database['public']['Tables']['gifts']['Row']
export type GiftInsert = Database['public']['Tables']['gifts']['Insert']
export type GiftUpdate = Database['public']['Tables']['gifts']['Update']

// Supabase types every view column as nullable — it cannot infer NOT NULL
// through a view. mapRow() coalesces each one; do not "fix" with `!`.
export type GiftTotalsRow =
  Database['public']['Views']['gifts_with_totals']['Row']

export type RsvpRow = Database['public']['Tables']['rsvp']['Row']
export type RsvpInsert = Database['public']['Tables']['rsvp']['Insert']
export type RsvpUpdate = Database['public']['Tables']['rsvp']['Update']

export type PixConfirmationRow =
  Database['public']['Tables']['pix_confirmations']['Row']
export type PixConfirmationInsert =
  Database['public']['Tables']['pix_confirmations']['Insert']
export type PixConfirmationUpdate =
  Database['public']['Tables']['pix_confirmations']['Update']

export type ReserveGiftArgs =
  Database['public']['Functions']['reserve_gift']['Args']
export type ReserveGiftReturn =
  Database['public']['Functions']['reserve_gift']['Returns']

export type ReserveGiftPaidArgs =
  Database['public']['Functions']['reserve_gift_paid']['Args']

export type SiteImageRow = Database['public']['Tables']['site_images']['Row']
export type SiteImageInsert =
  Database['public']['Tables']['site_images']['Insert']
export type SiteImageUpdate =
  Database['public']['Tables']['site_images']['Update']

export type GuestRow = Database['public']['Tables']['guests']['Row']
export type GuestInsert = Database['public']['Tables']['guests']['Insert']
export type GuestUpdate = Database['public']['Tables']['guests']['Update']

export type RsvpRequestRow =
  Database['public']['Tables']['rsvp_requests']['Row']
export type RsvpRequestInsert =
  Database['public']['Tables']['rsvp_requests']['Insert']
export type RsvpRequestUpdate =
  Database['public']['Tables']['rsvp_requests']['Update']

// --- Shareable generic invite links ----------------------------------------
export type InviteLinkRow = Database['public']['Tables']['invite_links']['Row']
export type InviteLinkInsert =
  Database['public']['Tables']['invite_links']['Insert']
export type InviteLinkUpdate =
  Database['public']['Tables']['invite_links']['Update']

// --- Wedding planning expenses ----------------------------------------------
export type ExpenseRow = Database['public']['Tables']['expenses']['Row']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']

export type ExpenseInstallmentRow =
  Database['public']['Tables']['expense_installments']['Row']
export type ExpenseInstallmentInsert =
  Database['public']['Tables']['expense_installments']['Insert']

// --- Background music playlist ----------------------------------------------
export type SongRow = Database['public']['Tables']['songs']['Row']
export type SongInsert = Database['public']['Tables']['songs']['Insert']
