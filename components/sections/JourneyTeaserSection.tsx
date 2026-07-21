import { Reveal } from '@/components/ui/Reveal'
import { ArrowRight, BookHeart } from 'lucide-react'
import Link from 'next/link'

type Props = {
  token: string
}

export function JourneyTeaserSection({ token }: Props) {
  const href = `/nossa-jornada?${new URLSearchParams({ token }).toString()}`

  return (
    <section
      id="nossa-jornada"
      className="relative overflow-hidden bg-[#faf6ef] py-20 md:py-28"
      aria-labelledby="journey-title"
    >
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-6">
        <Reveal className="text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-amber-700/20 bg-white/70 text-amber-800 shadow-sm">
            <BookHeart className="h-6 w-6" aria-hidden />
          </span>

          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-amber-700/80">
            Nossa história
          </p>

          <h2
            id="journey-title"
            className="mt-3 font-serif text-4xl tracking-tight text-amber-900 md:text-6xl"
          >
            Nossa <span className="italic">jornada</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl font-serif text-base italic leading-relaxed text-stone-700 md:text-lg">
            Antes deste grande dia, vivemos muitos capítulos especiais.
            Preparamos um cantinho para compartilhar alguns deles com você.
          </p>

          <Link
            href={href}
            className="
              group mt-8 inline-flex items-center justify-center gap-2
              rounded-full bg-amber-800 px-7 py-3 text-sm font-medium
              text-white shadow-sm transition
              hover:bg-amber-700 hover:shadow-md
              focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-amber-700 focus-visible:ring-offset-4
            "
          >
            Conhecer nossa jornada
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
