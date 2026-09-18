import type { WeddingDetails } from '../../types'

export const WEDDING_DETAILS: WeddingDetails = {
  couple: {
    bride: 'Ellen',
    groom: 'Bruno',
    initials: 'E.B',
  },
  date: '2026-10-24',
  displayDate: '24 de Outubro, 2026',
  time: '16:00',
  location: {
    venue: 'Sítio Sossego Events',
    city: 'Contagem, MG',
    address: 'R. Quatro, 38 - Chácara Novo Horizonte',
    mapUrl:
      'https://www.google.com/maps/place/Site+Sossego+Events/@-19.8484775,-44.0461564,17z/data=!3m1!4b1!4m6!3m5!1s0xa696b0aba81751:0x9407e22b19e9a4b9!8m2!3d-19.8484826!4d-44.0435815!16s%2Fg%2F11bzzyyrxs?entry=ttu&g_ep=EgoyMDI2MDUwMi4wIKXMDSoASAFQAw%3D%3D',
  },
  timeline: [
    { time: '15:30', label: 'Recepção dos convidados' },
    { time: '16:00', label: 'Cerimônia' },
    { time: '17:00', label: 'Coquetel & Fotos' },
    { time: '19:00', label: 'Jantar' },
    { time: '21:00', label: 'Festa & Dança' },
    { time: '00:00', label: 'Encerramento' },
  ],
  dressCode: [
    { name: 'Terracotta', hex: 'var(--color-terracotta)' },
    { name: 'Terracotta Claro', hex: 'var(--color-terracotta-light)' },
    { name: 'Azul Sereno', hex: 'var(--color-ocean)' },
    { name: 'Azul Claro', hex: 'var(--color-ocean-light)' },
    { name: 'Sage', hex: 'var(--color-sage)' },
    { name: 'Creme', hex: 'var(--color-cream-dark)' },
  ],
}

// Card payment is gated behind this minimum — small charges eat
// disproportionately into processor fees. Client-safe (no server secrets),
// unlike get-card-payment-service.ts, so gift payment UI can import it
// directly to compute Cartão-tab eligibility.
export const MIN_CARD_PAYMENT_AMOUNT = 10 // reais

export const SECTION_IDS = {
  hero: 'hero',
  monogram: 'monogram',
  invitation: 'invitation',
  location: 'location',
  timeline: 'timeline',
  dressCode: 'dress-code',
  rsvp: 'rsvp',
} as const

// --- Expense documents (contratos + comprovantes) ---------------------------
// Client-safe: the upload dialog imports these to reject a file before it
// costs a round-trip, and `document-upload.ts` re-checks them server-side.

export const EXPENSE_DOCUMENT_ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

/**
 * Images are compressed in the browser before they are posted (same
 * `browser-image-compression` pass as SiteImageUploadDialog), so the original
 * may be a full phone photo. PDFs are posted as-is and get the much tighter
 * `MAX_EXPENSE_DOCUMENT_STORED_BYTES` instead.
 */
export const MAX_EXPENSE_DOCUMENT_ORIGINAL_BYTES = 20 * 1024 * 1024

/**
 * Hard ceiling on what reaches Supabase Storage, matched by the bucket's own
 * `file_size_limit`. Also keeps a single upload comfortably under the 5 MB
 * Server Action body limit.
 */
export const MAX_EXPENSE_DOCUMENT_STORED_BYTES = 4 * 1024 * 1024

/**
 * Self-imposed slice of the 1 GB Supabase free tier reserved for expense
 * documents — the rest is shared by `wedding-images` and `wedding-audio`.
 * `uploadExpenseDocumentUseCase` refuses to write past it, and the despesas
 * page shows the gauge, so the tier is never hit by surprise.
 */
export const EXPENSE_DOCUMENTS_STORAGE_BUDGET_BYTES = 300 * 1024 * 1024

/** How long a signed document URL stays valid. Long enough to open and read a
 * PDF, short enough that a copied link is not a lasting leak. */
export const EXPENSE_DOCUMENT_SIGNED_URL_TTL_SECONDS = 60 * 10
