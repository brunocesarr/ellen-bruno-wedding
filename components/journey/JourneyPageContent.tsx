import { SmartImage } from '@/components/ui/SmartImage'
import type { ResolvedJourneyPage } from '@/src/lib/journey-catalog'
import { cn } from '@/src/lib/utils'

type Props = {
  page: ResolvedJourneyPage
  /** Compact spacing for the small right-hand page of the open book. */
  compact?: boolean
}

/**
 * Renders a single page's content. Layout-agnostic wrapper used both inside a book leaf
 * and in the reduced-motion vertical fallback. The chapter/title live on the book cover,
 * so a page shows only its (optional) heading and content.
 */
export function JourneyPageContent({ page, compact }: Props) {
  return (
    <article className="flex min-h-full flex-col">
      {page.heading ? (
        <header className="shrink-0 text-center">
          <h3
            className={cn(
              'font-display italic leading-tight text-terracotta-dark',
              compact ? 'text-2xl' : 'text-3xl'
            )}
          >
            {page.heading}
          </h3>
          <span className="mx-auto mt-3 block h-px w-16 bg-terracotta/40" />
        </header>
      ) : null}

      <div
        className={cn('flex min-h-0 flex-1 flex-col', page.heading && 'mt-4')}
      >
        <PageBody page={page} compact={compact} />
      </div>
    </article>
  )
}

/**
 * Polaroid frame width by photo count.
 *
 * For 1–2 photos the width is HEIGHT-DRIVEN: `w-[min(<pct>, <vh>)]`. Since the frame is
 * square, a vh-based width scales the photo with the leaf's height (the book leaf is
 * ~68vh tall, capped at 600px), while the percentage guards the page width on narrow
 * screens. When the page has ONLY photos (no heading/body competing for space) the caps
 * are raised so the photos grow to fill the whole leaf.
 *
 * For 3+ photos we keep fixed responsive widths so they wrap cleanly.
 */
function polaroidWidthClass(count: number, photosOnly: boolean) {
  if (count <= 1) {
    return photosOnly
      ? 'w-[min(92%,58vh)] sm:w-[min(88%,64vh)]'
      : 'w-[min(80%,46vh)] sm:w-[min(78%,50vh)]'
  }
  if (count === 2) {
    return photosOnly
      ? 'w-[min(48%,42vh)] sm:w-[min(48%,48vh)]'
      : 'w-[min(44%,34vh)] sm:w-[min(46%,40vh)]'
  }
  return photosOnly ? 'w-32 sm:w-40 md:w-44' : 'w-28 sm:w-36 md:w-40'
}

/** Matches the rendered widths above so Next.js requests an appropriately sharp file. */
function polaroidSizes(count: number, photosOnly: boolean) {
  if (count <= 1) {
    return photosOnly
      ? '(max-width: 640px) 92vw, 560px'
      : '(max-width: 640px) 80vw, 460px'
  }
  if (count === 2) {
    return photosOnly
      ? '(max-width: 640px) 48vw, 420px'
      : '(max-width: 640px) 44vw, 340px'
  }
  return photosOnly
    ? '(max-width: 640px) 32vw, 180px'
    : '(max-width: 640px) 30vw, 160px'
}

function PageBody({ page, compact }: Props) {
  switch (page.layout) {
    case 'text':
      return (
        <p
          className={cn(
            'flex flex-1 items-center justify-center text-center font-display leading-relaxed text-ink/85',
            compact ? 'text-lg' : 'text-xl md:text-2xl'
          )}
        >
          {page.body}
        </p>
      )

    case 'polaroids': {
      const count = page.photos.length
      // A page with no heading and no body text is "photos only" — let the images
      // take over the whole page instead of floating small in the middle.
      const photosOnly = !page.heading && !page.body
      const widthClass = polaroidWidthClass(count, photosOnly)
      const sizes = polaroidSizes(count, photosOnly)
      return (
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Media area grows to fill the leaf; photos are centred and scale with height. */}
          <div className="flex min-h-0 flex-1 flex-wrap content-center items-center justify-center gap-3 sm:gap-4">
            {page.photos.map((photo, i) => (
              <figure
                key={photo.key}
                className={cn(
                  'polaroid shrink-0',
                  widthClass,
                  (photo.tilt ?? (i % 2 === 0 ? 'left' : 'right')) === 'left'
                    ? 'polaroid-tilt-left'
                    : 'polaroid-tilt-right'
                )}
              >
                <div className="relative aspect-square overflow-hidden bg-stone-100">
                  <SmartImage
                    src={photo.src}
                    fallback={photo.fallback}
                    alt={photo.alt}
                    fill
                    sizes={sizes}
                    className="object-cover"
                  />
                </div>
                {photo.caption ? (
                  <figcaption className="pt-2 text-center font-script text-lg text-charcoal">
                    {photo.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
          {page.body ? (
            <p className="mt-4 shrink-0 text-center text-sm text-ink/70">
              {page.body}
            </p>
          ) : null}
        </div>
      )
    }

    case 'photo-caption':
    default: {
      const photo = page.photos[0]
      // No caption/heading → the single photo should fill the entire leaf.
      const photosOnly = !page.heading && !page.body
      return (
        <div className="flex min-h-0 flex-1 flex-col">
          {photo ? (
            <div
              className={cn(
                'relative flex-1 overflow-hidden rounded-sm border-4 border-white bg-stone-100 shadow-[0_8px_24px_rgba(0,0,0,0.12)]',
                photosOnly ? 'min-h-[280px]' : 'min-h-[200px]'
              )}
            >
              <SmartImage
                src={photo.src}
                fallback={photo.fallback}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 85vw, 45vw"
                className="object-cover"
              />
            </div>
          ) : null}
          {page.body ? (
            <p
              className={cn(
                'mt-4 shrink-0 text-center font-display italic leading-relaxed text-ink/85',
                compact ? 'text-base' : 'text-lg md:text-xl'
              )}
            >
              {page.body}
            </p>
          ) : null}
        </div>
      )
    }
  }
}
