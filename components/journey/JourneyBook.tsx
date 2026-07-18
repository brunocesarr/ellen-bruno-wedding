'use client'

import type {
  ResolvedJourneyBook,
  ResolvedJourneyPage,
} from '@/src/lib/journey-catalog'
import { cn } from '@/src/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import { JourneyPageContent } from './JourneyPageContent'

type Leaf =
  | { kind: 'cover' }
  | { kind: 'page'; page: ResolvedJourneyPage }
  | { kind: 'end' }

type Props = {
  book: ResolvedJourneyBook
  coupleInitials?: string
  /** When provided, renders a "back to the shelf" control. */
  onClose?: () => void
  /** When provided, the end panel offers a direct jump to the next book. */
  onNextBook?: () => void
  /** Title of the next book, shown on the "next chapter" button. */
  nextBookTitle?: string
}

const TURN = { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const }
const SLIDE = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }

// Mobile page-turn: a single leaf rotates on its left edge. Because only one leaf is
// mounted at a time (AnimatePresence mode="wait"), there's no second face to bleed
// through — so we get the book-flip feel without the iOS backface-visibility glitch.
// At ±90° the page is edge-on (effectively invisible); opacity smooths the hand-off.
const pageFlipVariants = {
  enter: (dir: number) => ({ rotateY: dir >= 0 ? 90 : -90, opacity: 0 }),
  center: { rotateY: 0, opacity: 1 },
  exit: (dir: number) => ({ rotateY: dir >= 0 ? -90 : 90, opacity: 0 }),
}

export function JourneyBook({
  book,
  coupleInitials = 'E&B',
  onClose,
  onNextBook,
  nextBookTitle,
}: Props) {
  const reduce = useReducedMotion()

  // The 3D flip is desktop-only; on narrow/mobile screens we use a single-leaf flip.
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const leaves: Leaf[] = [
    { kind: 'cover' },
    ...book.pages.map((page) => ({ kind: 'page' as const, page })),
    { kind: 'end' },
  ]
  const total = leaves.length

  // `turned` = how many leaves have been flipped to the left. The readable leaf is
  // leaves[turned]. 0 = closed on the cover; total - 1 = the end page.
  const [turned, setTurned] = useState(0)
  const [animating, setAnimating] = useState<number | null>(null)
  // Direction of the last navigation, for the mobile flip (1 = forward, -1 = back).
  const [dir, setDir] = useState(1)

  const goNext = useCallback(() => {
    setDir(1)
    setTurned((t) => {
      if (t >= total - 1) return t
      setAnimating(t)
      return t + 1
    })
  }, [total])

  const goPrev = useCallback(() => {
    setDir(-1)
    setTurned((t) => {
      if (t <= 0) return t
      setAnimating(t - 1)
      return t - 1
    })
  }, [])

  // On the very last leaf (the end panel), "next" should jump straight to the next
  // book instead of doing nothing.
  const handleNext = useCallback(() => {
    if (turned >= total - 1) {
      onNextBook?.()
      return
    }
    goNext()
  }, [turned, total, goNext, onNextBook])

  const nextDisabled = turned >= total - 1 && !onNextBook

  useEffect(() => {
    if (reduce) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleNext, goPrev, reduce])

  // Reduced motion: a plain vertical read, no 3D.
  if (reduce) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        {onClose ? <BackToShelf onClose={onClose} /> : null}
        <CoverPanel book={book} coupleInitials={coupleInitials} static />
        {book.pages.map((page) => (
          <div
            key={page.id}
            className="paper-texture rounded-sm bg-paper p-6 shadow-[0_8px_32px_rgba(61,54,50,0.1)] md:p-8"
          >
            <JourneyPageContent page={page} />
          </div>
        ))}
        <EndPanel
          coupleInitials={coupleInitials}
          onClose={onClose}
          onNextBook={onNextBook}
          nextBookTitle={nextBookTitle}
        />
      </div>
    )
  }

  // Mobile: single-leaf page flip. Only one page is mounted at a time, so no backface
  // bleed / image persistence — but we still get a real page-turn effect.
  // if (isMobile) {
  //   const leaf = leaves[turned]
  //   if (!leaf) return null
  //   return (
  //     <div className="flex flex-col items-center gap-6">
  //       {onClose ? <BackToShelf onClose={onClose} /> : null}
  //       <div
  //         className="relative mx-auto h-[68vh] max-h-[600px] min-h-[440px] w-[min(92vw,22rem)] select-none [perspective:1600px]"
  //         style={{ perspectiveOrigin: '50% 45%' }}
  //       >
  //         {/* Click zones for prev / next. */}
  //         <button
  //           type="button"
  //           aria-label="Página anterior"
  //           onClick={goPrev}
  //           disabled={turned <= 0}
  //           className="absolute inset-y-0 left-0 z-[60] w-1/2 disabled:cursor-default"
  //         />
  //         <button
  //           type="button"
  //           aria-label="Próxima página"
  //           onClick={handleNext}
  //           disabled={nextDisabled}
  //           className="absolute inset-y-0 right-0 z-[60] w-1/2 disabled:cursor-default"
  //         />

  //         <AnimatePresence mode="wait" custom={dir} initial={false}>
  //           <motion.div
  //             key={turned}
  //             className="absolute inset-0 origin-left overflow-hidden rounded-md bg-paper shadow-[0_8px_32px_rgba(61,54,50,0.18)] [transform-style:preserve-3d]"
  //             custom={dir}
  //             variants={pageFlipVariants}
  //             initial="enter"
  //             animate="center"
  //             exit="exit"
  //             transition={SLIDE}
  //             style={{ willChange: 'transform' }}
  //           >
  //             <LeafFace
  //               leaf={leaf}
  //               book={book}
  //               coupleInitials={coupleInitials}
  //               onClose={onClose}
  //               onNextBook={onNextBook}
  //               nextBookTitle={nextBookTitle}
  //             />
  //           </motion.div>
  //         </AnimatePresence>
  //       </div>

  //       <Controls
  //         turned={turned}
  //         total={total}
  //         onPrev={goPrev}
  //         onNext={handleNext}
  //         nextDisabled={nextDisabled}
  //       />
  //     </div>
  //   )
  // }

  return (
    <div className="flex flex-col items-center gap-6">
      {onClose ? <BackToShelf onClose={onClose} /> : null}
      {/* Stage — establishes the 3D perspective. */}
      <div
        className="w-full select-none [perspective:2200px]"
        style={{ perspectiveOrigin: '50% 40%' }}
      >
        <div
          className="relative mx-auto h-[68vh] max-h-[600px] min-h-[440px] w-[min(92vw,22rem)] [transform-style:preserve-3d] md:w-[min(94vw,52rem)]"
          role="group"
          aria-roledescription="livro"
          aria-label={book.title}
        >
          {/* Static left inside-cover (visible on the open, desktop spread). */}
          {turned > 0 && (
            <div className="absolute inset-y-0 left-0 hidden w-1/2 rounded-l-md bg-cream-100 shadow-inner md:block" />
          )}

          {/* Click zones for prev / next. */}
          <button
            type="button"
            aria-label="Página anterior"
            onClick={goPrev}
            disabled={turned <= 0}
            className="absolute inset-y-0 left-0 z-[60] w-1/2 cursor-w-resize disabled:cursor-default"
          />
          <button
            type="button"
            aria-label="Próxima página"
            onClick={handleNext}
            disabled={nextDisabled}
            className="absolute inset-y-0 right-0 z-[60] w-1/2 cursor-e-resize disabled:cursor-default"
          />

          {leaves.map((leaf, i) => {
            const isTurned = i < turned
            const z = animating === i ? total + 5 : isTurned ? i : total - i

            return (
              <motion.div
                key={i}
                className={
                  'absolute inset-y-0 right-0 w-full origin-left [transform-style:preserve-3d] md:w-1/2'
                }
                style={{ zIndex: z, willChange: 'transform' }}
                initial={false}
                animate={{ rotateY: isTurned ? -180 : 0 }}
                transition={TURN}
                onAnimationComplete={() =>
                  setAnimating((a) => (a === i ? null : a))
                }
              >
                {/* Front face — the readable page. */}
                <div
                  className="absolute inset-0 overflow-hidden rounded-r-md [backface-visibility:hidden] md:rounded-l-none"
                  style={{
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                    transform: 'translateZ(1px)',
                  }}
                >
                  <LeafFace
                    leaf={leaf}
                    book={book}
                    coupleInitials={coupleInitials}
                    onClose={onClose}
                    onNextBook={onNextBook}
                    nextBookTitle={nextBookTitle}
                  />
                </div>
                {/* Back face — blank paper backing seen once turned. */}
                <div
                  className="absolute inset-0 overflow-hidden rounded-l-md bg-paper [backface-visibility:hidden] [transform:rotateY(180deg)]"
                  style={{
                    WebkitBackfaceVisibility: 'hidden',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg) translateZ(1px)',
                  }}
                >
                  <div className="paper-texture h-full w-full opacity-70" />
                </div>
              </motion.div>
            )
          })}

          {/* Spine shadow down the centre of the open book. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 z-[70] hidden w-8 -translate-x-1/2 md:block"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(61,54,50,0.14), transparent)',
            }}
          />
        </div>
      </div>

      <Controls
        turned={turned}
        total={total}
        onPrev={goPrev}
        onNext={handleNext}
        nextDisabled={nextDisabled}
      />
    </div>
  )
}

function LeafFace({
  leaf,
  book,
  coupleInitials,
  onClose,
  onNextBook,
  nextBookTitle,
}: {
  leaf: Leaf
  book: ResolvedJourneyBook
  coupleInitials: string
  onClose?: () => void
  onNextBook?: () => void
  nextBookTitle?: string
}) {
  if (leaf.kind === 'cover') {
    return <CoverPanel book={book} coupleInitials={coupleInitials} />
  }
  if (leaf.kind === 'end') {
    return (
      <EndPanel
        coupleInitials={coupleInitials}
        onClose={onClose}
        onNextBook={onNextBook}
        nextBookTitle={nextBookTitle}
      />
    )
  }
  return (
    <div className="paper-texture h-full w-full bg-paper">
      <div className="h-full overflow-y-auto p-6 md:p-8">
        <JourneyPageContent page={leaf.page} compact />
      </div>
    </div>
  )
}

function CoverPanel({
  book,
  coupleInitials,
  static: isStatic,
}: {
  book: ResolvedJourneyBook
  coupleInitials: string
  static?: boolean
}) {
  return (
    <div
      className={cn(
        'flex h-full flex-col items-center justify-center bg-terracotta px-8 text-center text-cream',
        isStatic ? 'rounded-sm py-16' : 'rounded-r-md md:rounded-l-none'
      )}
      style={{
        backgroundImage:
          'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(0,0,0,0.12))',
      }}
    >
      <span className="monogram-ring grid h-14 w-14 place-items-center rounded-full border-cream/70 font-display text-lg tracking-wide text-cream">
        {coupleInitials}
      </span>
      <p className="mt-6 text-xs uppercase tracking-[0.32em] text-cream/80">
        {book.chapter}
      </p>
      <h1 className="mt-3 font-script text-4xl leading-tight md:text-5xl">
        {book.title}
      </h1>
      {book.dateLabel ? (
        <p className="mt-2 font-display text-lg italic text-cream/90">
          {book.dateLabel}
        </p>
      ) : null}
      <span className="mt-6 block h-px w-20 bg-cream/50" />
      <p className="mt-6 text-xs uppercase tracking-[0.28em] text-cream/70">
        Vire a página →
      </p>
    </div>
  )
}

function EndPanel({
  coupleInitials,
  onClose,
  onNextBook,
  nextBookTitle,
}: {
  coupleInitials: string
  onClose?: () => void
  onNextBook?: () => void
  nextBookTitle?: string
}) {
  return (
    <div className="paper-texture flex h-full flex-col items-center justify-center rounded-r-md bg-paper px-8 text-center md:rounded-l-none">
      <span className="monogram-ring grid h-14 w-14 place-items-center rounded-full font-display text-lg text-terracotta">
        {coupleInitials}
      </span>
      <h2 className="mt-6 font-script text-4xl text-terracotta-dark md:text-5xl">
        continua…
      </h2>
      {onNextBook ? (
        <>
          <p className="mt-4 max-w-xs font-display text-lg italic text-ink/80">
            O próximo capítulo da nossa história te espera.
          </p>
          <button
            type="button"
            onClick={onNextBook}
            className="mt-6 rounded-full bg-terracotta px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition hover:bg-terracotta-dark"
          >
            Próximo capítulo{nextBookTitle ? `: ${nextBookTitle}` : ''}
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="mt-3 font-display text-sm uppercase tracking-wide text-ink/60 underline-offset-4 transition hover:text-ink hover:underline"
            >
              Voltar à estante
            </button>
          ) : null}
        </>
      ) : (
        <>
          <p className="mt-4 max-w-xs font-display text-lg italic text-ink/80">
            Essa foi a nossa última página… por agora.
          </p>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-terracotta px-6 py-3 font-display text-sm uppercase tracking-wide text-cream transition hover:bg-terracotta-dark"
            >
              Voltar à estante
            </button>
          ) : null}
        </>
      )}
    </div>
  )
}

function BackToShelf({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="inline-flex items-center gap-2 self-start rounded-full border border-terracotta/30 bg-cream/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-terracotta-dark backdrop-blur transition hover:bg-terracotta hover:text-cream"
    >
      ← Voltar à estante
    </button>
  )
}

function Controls({
  turned,
  total,
  onPrev,
  onNext,
  nextDisabled,
}: {
  turned: number
  total: number
  onPrev: () => void
  onNext: () => void
  nextDisabled: boolean
}) {
  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={onPrev}
        disabled={turned <= 0}
        aria-label="Página anterior"
        className="grid h-11 w-11 place-items-center rounded-full border border-terracotta/40 bg-cream/70 text-terracotta backdrop-blur transition hover:bg-terracotta hover:text-cream disabled:pointer-events-none disabled:opacity-30"
      >
        ←
      </button>
      <span className="min-w-[4rem] rounded-full bg-cream/70 px-3 py-1 text-center text-sm tabular-nums text-ink-muted backdrop-blur">
        {turned + 1} / {total}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        aria-label="Próxima página"
        className="grid h-11 w-11 place-items-center rounded-full border border-terracotta/40 bg-cream/70 text-terracotta backdrop-blur transition hover:bg-terracotta hover:text-cream disabled:pointer-events-none disabled:opacity-30"
      >
        →
      </button>
    </div>
  )
}
