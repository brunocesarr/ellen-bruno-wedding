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
    <article className="flex h-full flex-col">
      {page.heading ? (
        <header className="text-center">
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

      <div className={cn('flex flex-1 flex-col', page.heading && 'mt-5')}>
        <PageBody page={page} compact={compact} />
      </div>
    </article>
  )
}

function PageBody({ page, compact }: Props) {
  switch (page.layout) {
    case 'text':
      return (
        <p
          className={cn(
            'my-auto text-center font-display leading-relaxed text-ink/85',
            compact ? 'text-lg' : 'text-xl md:text-2xl'
          )}
        >
          {page.body}
        </p>
      )

    case 'polaroids':
      return (
        <div className="my-auto">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {page.photos.map((photo, i) => (
              <figure
                key={photo.key}
                className={cn(
                  'polaroid w-32 shrink-0 sm:w-36',
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
                    sizes="160px"
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
            <p className="mt-5 text-center text-sm text-ink/70">{page.body}</p>
          ) : null}
        </div>
      )

    case 'photo-caption':
    default: {
      const photo = page.photos[0]
      return (
        <div className="flex flex-1 flex-col">
          {photo ? (
            <div className="relative flex-1 overflow-hidden rounded-sm border-4 border-white bg-stone-100 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <SmartImage
                src={photo.src}
                fallback={photo.fallback}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 90vw, 40vw"
                className="object-cover"
              />
            </div>
          ) : null}
          {page.body ? (
            <p
              className={cn(
                'mt-4 text-center font-display italic leading-relaxed text-ink/85',
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
