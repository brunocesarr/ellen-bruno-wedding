'use client'

import {
  SHELF_DECOR_BOOKS,
  type ResolvedJourneyBook,
  type ShelfDecorBook,
} from '@/src/lib/journey-catalog'
import { cn } from '@/src/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { JourneyBook } from './JourneyBook'

type ShelfItem =
  | { type: 'book'; book: ResolvedJourneyBook }
  | { type: 'decor'; decor: ShelfDecorBook }

type Props = {
  books: ResolvedJourneyBook[]
  coupleInitials?: string
  guestFirstName?: string | null
}

type SpineColor = ShelfDecorBook['color']

const SPINE_BG: Record<SpineColor, string> = {
  sage: 'bg-sage',
  ocean: 'bg-ocean',
  cream: 'bg-cream-200',
  terracotta: 'bg-terracotta',
  blush: 'bg-blush',
}
const SPINE_TEXT: Record<SpineColor, string> = {
  sage: 'text-cream/90',
  ocean: 'text-cream/90',
  cream: 'text-charcoal/60',
  terracotta: 'text-cream/90',
  blush: 'text-charcoal/60',
}

const EASE = [0.22, 1, 0.36, 1] as const

export function JourneyLibrary({
  books,
  coupleInitials = 'E&B',
  guestFirstName,
}: Props) {
  const reduce = useReducedMotion()
  const [openId, setOpenId] = useState<string | null>(null)

  const openIndex = books.findIndex((b) => b.id === openId)
  const openBook = openIndex >= 0 ? books[openIndex] : null
  const nextBook =
    openIndex >= 0 && openIndex < books.length - 1 ? books[openIndex + 1] : null

  // Interleave the openable step-books with decorative fillers for a library feel.
  const shelf = useMemo<ShelfItem[]>(() => {
    const items: ShelfItem[] = []
    books.forEach((book, i) => {
      items.push({ type: 'book', book })
      const decor = SHELF_DECOR_BOOKS[i]
      if (decor) items.push({ type: 'decor', decor })
    })
    return items
  }, [books])

  const renderItem = (item: ShelfItem) =>
    item.type === 'book' ? (
      <BookSpine
        key={item.book.id}
        book={item.book}
        reduce={!!reduce}
        onOpen={() => setOpenId(item.book.id)}
      />
    ) : (
      <DecorSpine key={`decor-${item.decor.id}`} book={item.decor} />
    )

  return (
    <div className="relative min-h-screen-safe overflow-hidden">
      <LibraryBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8 md:py-12">
        <AnimatePresence mode="wait">
          {openBook ? (
            <motion.div
              key={`reading-${openBook.id}`}
              className="[transform-style:preserve-3d]"
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, rotateY: -55, scale: 0.85 }
              }
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, rotateY: -35, scale: 0.9 }
              }
              transition={{ duration: 0.75, ease: EASE }}
            >
              <JourneyBook
                book={openBook}
                coupleInitials={coupleInitials}
                onClose={() => setOpenId(null)}
                onNextBook={nextBook ? () => setOpenId(nextBook.id) : undefined}
                nextBookTitle={nextBook?.title}
              />
            </motion.div>
          ) : (
            <motion.div
              key="shelf"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, rotateX: 22, y: 40, scale: 0.92 }
              }
              transition={{ duration: 0.6, ease: EASE }}
              style={{ transformOrigin: 'center bottom' }}
            >
              <header className="mb-8 text-center">
                <p className="eyebrow text-cream/80">Nossa história</p>
                <h1 className="mt-2 font-script text-4xl text-cream md:text-5xl [text-shadow:0_2px_12px_rgba(0,0,0,0.35)]">
                  A biblioteca da nossa jornada
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm text-cream/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]">
                  {guestFirstName ? `${guestFirstName}, cada ` : 'Cada '}livro é
                  um capítulo da nossa história. Retire um da estante para
                  folhear.
                </p>
              </header>

              <Bookcase items={shelf} renderItem={renderItem} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/** The reference library photo, warm-toned so the foreground shelf stays legible. */
function LibraryBackdrop() {
  return (
    <div aria-hidden className="absolute inset-0">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/journey/library-bg.jpg')" }}
      />
      {/* Warm wash + darkening so books pop and cool tones read on-brand. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(155,94,63,0.55) 0%, rgba(61,54,50,0.55) 55%, rgba(61,54,50,0.72) 100%)',
          mixBlendMode: 'multiply',
        }}
      />
      <div className="absolute inset-0 bg-terracotta/15 backdrop-blur-[2px]" />
    </div>
  )
}

/**
 * A bookcase that wraps its spines onto as many stacked shelf levels as needed: it
 * measures the available width and packs each level with as many spines as fit within
 * the device's field of view, spilling the rest onto the shelf below.
 */
function Bookcase({
  items,
  renderItem,
}: {
  items: ShelfItem[]
  renderItem: (item: ShelfItem) => React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  // Start with everything on one level (SSR / first paint), then measure and re-flow.
  const [perRow, setPerRow] = useState(items.length || 1)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const isMd = window.innerWidth >= 768
      const pad = isMd ? 48 : 24 // matches the level's px-6 / px-3
      const slot = isMd ? 58 : 48 // widest spine + gap, kept conservative
      const usable = el.clientWidth - pad
      setPerRow(Math.max(1, Math.floor(usable / slot)))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const rows: ShelfItem[][] = []
  for (let i = 0; i < items.length; i += perRow) {
    rows.push(items.slice(i, i + perRow))
  }

  return (
    <div ref={ref} className="space-y-2 [perspective:1600px] md:space-y-3">
      {rows.map((row, idx) => (
        <ShelfLevel key={idx}>{row.map(renderItem)}</ShelfLevel>
      ))}
    </div>
  )
}

/** One level of the bookcase: an interior back panel + a ledge the books stand on. */
function ShelfLevel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div
        className="rounded-t-lg px-3 pt-10 md:px-6"
        style={{
          background:
            'linear-gradient(180deg, #6f4a34 0%, #855536 55%, #7a4e33 100%)',
          boxShadow: 'inset 0 12px 28px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex items-end justify-center gap-1.5 pb-1 md:gap-2">
          {children}
        </div>
      </div>
      {/* Ledge */}
      <div
        className="h-4 rounded-b-lg md:h-5"
        style={{
          background:
            'linear-gradient(180deg, #b07548 0%, #7a4e33 60%, #5e3c27 100%)',
          boxShadow: '0 14px 26px rgba(0,0,0,0.4)',
        }}
      />
    </div>
  )
}

function spineHeight(factor: number) {
  return `clamp(9rem, ${(factor * 34).toFixed(1)}vh, ${(factor * 14).toFixed(2)}rem)`
}

function DecorSpine({ book }: { book: ShelfDecorBook }) {
  return (
    <motion.div
      whileHover={{ y: -6, rotateZ: -1 }}
      transition={{ duration: 0.3, ease: EASE }}
      aria-hidden
      className={cn(
        'flex w-7 shrink-0 select-none items-center justify-center rounded-t-sm md:w-8',
        SPINE_BG[book.color],
        SPINE_TEXT[book.color]
      )}
      style={{
        height: spineHeight(book.height),
        boxShadow:
          'inset -6px 0 10px rgba(0,0,0,0.18), inset 4px 0 6px rgba(255,255,255,0.12)',
      }}
    >
      <span className="font-display text-[0.65rem] tracking-wide [writing-mode:vertical-rl] [transform:rotate(180deg)]">
        {book.title}
      </span>
    </motion.div>
  )
}

function BookSpine({
  book,
  reduce,
  onOpen,
}: {
  book: ResolvedJourneyBook
  reduce: boolean
  onOpen: () => void
}) {
  const color = book.spineColor
  const chapterNo = book.chapter.replace(/[^0-9]/g, '') || '•'
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Abrir o livro "${book.title}"`}
      whileHover={reduce ? undefined : { y: -22, rotateZ: -2, scale: 1.03 }}
      whileTap={reduce ? undefined : { y: -14, scale: 0.99 }}
      transition={{ duration: 0.35, ease: EASE }}
      className={cn(
        'group relative flex w-10 shrink-0 cursor-pointer select-none flex-col items-center justify-between rounded-t-sm py-3 md:w-12',
        SPINE_BG[color],
        SPINE_TEXT[color]
      )}
      style={{
        height: spineHeight(1.06),
        boxShadow:
          'inset -7px 0 12px rgba(0,0,0,0.24), inset 5px 0 7px rgba(255,255,255,0.16), 0 6px 16px rgba(0,0,0,0.3)',
      }}
    >
      <span
        className={cn(
          'grid h-5 w-5 place-items-center rounded-full border text-[0.6rem] font-medium',
          color === 'cream' || color === 'blush'
            ? 'border-charcoal/40 text-charcoal/70'
            : 'border-cream/70 text-cream/90'
        )}
      >
        {chapterNo}
      </span>
      <span className="font-display text-[0.68rem] font-medium uppercase tracking-[0.12em] [writing-mode:vertical-rl] [transform:rotate(180deg)]">
        {book.title}
      </span>
      <span className="h-3 w-3" />
      <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] uppercase tracking-[0.18em] text-cream opacity-0 transition-opacity duration-300 [text-shadow:0_1px_6px_rgba(0,0,0,0.5)] group-hover:opacity-100">
        abrir
      </span>
    </motion.button>
  )
}
