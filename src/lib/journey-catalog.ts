/**
 * "Nossa Jornada Até Aqui" — a little library shown on /nossa-jornada (token-gated).
 *
 * Each STEP of the couple's story is its own BOOK on the shelf; a book holds one or more
 * PAGES. Pulling a book off the shelf opens it into the 3D flip-book.
 *
 * HOW TO EDIT: this file is the single source of truth.
 *  - Add / remove / reorder a step  → edit `JOURNEY_BOOKS` (each entry is one book).
 *  - Give a book more pages         → add entries to that book's `pages` array.
 *  - Swap a photo                   → it's referenced by `key`; the key is registered in
 *    `SITE_IMAGE_CATALOG` (site-images-catalog.ts) so a real photo can be uploaded from
 *    the /admin/imagens page without touching code. New photo key? Register it there too.
 *  - Dress the shelf                → edit `SHELF_DECOR_BOOKS` (purely decorative spines).
 */

export type JourneyLayout = 'photo-caption' | 'text' | 'polaroids'

export type JourneyPhoto = {
  /** A key registered in SITE_IMAGE_CATALOG. */
  key: string
  /** Optional handwritten-style caption printed under a polaroid. */
  caption?: string
  /** Tilt direction for the polaroid layout. Alternates automatically if omitted. */
  tilt?: 'left' | 'right'
}

/** One leaf of a book. */
export type JourneyPage = {
  id: string
  layout: JourneyLayout
  /** Optional sub-heading shown above the content (handy for multi-page books). */
  heading?: string
  /** Caption (photo-caption) or the paragraph body (text / polaroids intro). */
  body?: string
  /** Photos to show. Empty/omitted for the 'text' layout. */
  photos?: JourneyPhoto[]
}

/** One step of the story = one book on the shelf. */
export type JourneyBookDef = {
  id: string
  /** e.g. "Capítulo 1" — small eyebrow on the cover. */
  chapter: string
  /** e.g. "O primeiro beijo". */
  title: string
  /** e.g. "2019" or "24 de Outubro, 2026". Optional. */
  dateLabel?: string
  /** Spine colour on the shelf. */
  spineColor: 'terracotta' | 'sage' | 'ocean' | 'blush' | 'cream'
  pages: JourneyPage[]
}

export const JOURNEY_BOOKS: JourneyBookDef[] = [
  {
    id: 'primeiro-beijo',
    chapter: 'Capítulo 1',
    title: 'O primeiro beijo',
    dateLabel: '2016',
    spineColor: 'terracotta',
    pages: [
      {
        id: 'primeiro-beijo-1',
        layout: 'photo-caption',
        body: 'Foi assim que tudo começou — um instante, um sorriso, e a certeza de que aquela noite mudaria tudo.',
        photos: [{ key: 'journey-first-kiss' }],
      },
    ],
  },
  {
    id: 'primeiro-ano',
    chapter: 'Capítulo 2',
    title: 'O primeiro ano',
    dateLabel: '2017',
    spineColor: 'sage',
    pages: [
      {
        id: 'primeiro-ano-1',
        layout: 'text',
        body: 'Aprendemos o ritmo um do outro nos detalhes miúdos: o café da manhã dividido, as risadas no fim do dia, os planos rabiscados em guardanapos. Um ano inteiro para descobrir que o extraordinário mora justamente no cotidiano — quando é ao lado da pessoa certa.',
      },
    ],
  },
  {
    id: 'primeira-viagem',
    chapter: 'Capítulo 3',
    title: 'A primeira viagem juntos',
    dateLabel: '10 de Julho, 2022',
    spineColor: 'ocean',
    // Two pages — an opening note, then the polaroids.
    pages: [
      {
        id: 'primeira-viagem-1',
        layout: 'text',
        heading: 'Pé na estrada',
        body: 'Fizemos as malas quase sem pensar. O destino importava menos que a companhia — e foi na estrada que descobrimos que viajaríamos bem juntos pela vida inteira.',
      },
      {
        id: 'primeira-viagem-2',
        layout: 'polaroids',
        body: 'A estrada, os mapas errados e as memórias que ficaram.',
        photos: [
          { key: 'journey-trip-1', caption: 'A caminho', tilt: 'left' },
          { key: 'journey-trip-2', caption: 'Perdidos & felizes', tilt: 'right' },
          { key: 'journey-trip-3', caption: 'O pôr do sol', tilt: 'left' },
        ],
      },
    ],
  },
  {
    id: 'o-pedido',
    chapter: 'Capítulo 4',
    title: 'O pedido',
    dateLabel: '19 de Maio, 2024',
    spineColor: 'blush',
    pages: [
      {
        id: 'o-pedido-1',
        layout: 'photo-caption',
        body: 'Lá em cima, entre as nuvens e o balão, uma pergunta e um "sim" que ecoou mais alto que o vento.',
        photos: [{ key: 'journey-proposal' }],
      },
    ],
  },
  {
    id: 'o-grande-dia',
    chapter: 'Capítulo 5',
    title: 'O grande dia',
    dateLabel: '24 de Outubro, 2026',
    spineColor: 'terracotta',
    pages: [
      {
        id: 'o-grande-dia-1',
        layout: 'photo-caption',
        body: 'E agora, a página que ainda vamos escrever. Mal podemos esperar para dizer "sim" diante de quem amamos.',
        photos: [{ key: 'journey-big-day' }],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Resolved shapes — photos resolved to concrete URLs server-side.
// ---------------------------------------------------------------------------

export type ResolvedJourneyPhoto = JourneyPhoto & {
  src: string
  fallback: string
  alt: string
}

export type ResolvedJourneyPage = Omit<JourneyPage, 'photos'> & {
  photos: ResolvedJourneyPhoto[]
}

export type ResolvedJourneyBook = Omit<JourneyBookDef, 'pages'> & {
  pages: ResolvedJourneyPage[]
}

/** Every image key referenced across all books, deduped — resolved in one pass. */
export const JOURNEY_IMAGE_KEYS = Array.from(
  new Set(
    JOURNEY_BOOKS.flatMap((b) =>
      b.pages.flatMap((p) => (p.photos ?? []).map((photo) => photo.key))
    )
  )
) as readonly string[]

// ---------------------------------------------------------------------------
// Decorative shelf dressing (purely cosmetic, not openable).
// ---------------------------------------------------------------------------

export type ShelfDecorBook = {
  id: string
  title: string
  color: 'sage' | 'ocean' | 'cream' | 'terracotta' | 'blush'
  height: number
}

export const SHELF_DECOR_BOOKS: ShelfDecorBook[] = [
  { id: 'cartas', title: 'Cartas', color: 'sage', height: 0.94 },
  { id: 'poemas', title: 'Poemas', color: 'ocean', height: 1 },
  { id: 'sonhos', title: 'Sonhos', color: 'cream', height: 0.88 },
  { id: 'cancoes', title: 'Canções', color: 'blush', height: 0.9 },
  { id: 'lugares', title: 'Lugares', color: 'sage', height: 0.99 },
]
