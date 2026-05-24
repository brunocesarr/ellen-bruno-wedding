import { Reveal } from '@/components/ui/Reveal'
import { getOrderedSiteImages } from '@/src/lib/get-site-image'
import { AboutPhotos } from './AboutPhotos'

const ABOUT_KEYS = ['about-1', 'about-2', 'about-3'] as const

export async function AboutSection() {
  const photos = await getOrderedSiteImages(ABOUT_KEYS)

  return (
    <section
      id="sobre-nos"
      className="relative overflow-hidden bg-[#faf6ef] py-20 md:py-28"
      aria-labelledby="about-title"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-2 md:items-end md:gap-16">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.4em] text-amber-700/80">
              Nossa história
            </p>
            <h2
              id="about-title"
              className="mt-3 font-serif text-4xl tracking-tight text-amber-900 md:text-6xl"
            >
              Sobre <span className="italic">nós</span>
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="font-serif text-base italic leading-relaxed text-stone-700 md:text-lg">
              Tudo começou com um simples olhar e se transformou em parceria,
              cumplicidade e o amor que celebramos hoje.
            </p>
          </Reveal>
        </div>

        <AboutPhotos photos={photos} />
      </div>

      <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl" />
    </section>
  )
}
