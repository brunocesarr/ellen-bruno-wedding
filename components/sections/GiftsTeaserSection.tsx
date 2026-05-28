import {
  GiftsTeaserClient,
  Polaroid,
} from '@/components/sections/GiftsTeaserClient'
import { Reveal } from '@/components/ui/Reveal'
import { getOrderedSiteImages } from '@/src/lib/get-site-image'
import Link from 'next/link'

const POLAROID_KEYS = ['polaroid-1', 'polaroid-2', 'polaroid-3'] as const

type Props = {
  token?: string
}

export async function GiftsTeaserSection({ token }: Props) {
  const photos = await getOrderedSiteImages(POLAROID_KEYS)
  const polaroids: Polaroid[] =
    POLAROID_KEYS.map((k, i) => {
      return {
        label: ['emoção', 'amor', 'para sempre'][i],
        ...photos[i],
      } as Polaroid
    }).filter((p) => p) ?? []

  return (
    <section
      id="presentes"
      className="relative overflow-hidden bg-gradient-to-br from-[#faf6ef] via-[#f5efe4] to-[#ede2cd] py-20 md:py-28"
      aria-labelledby="gifts-teaser-title"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <div className="order-2 md:order-1">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.4em] text-amber-700/80">
                Lista de presentes
              </p>
              <h2
                id="gifts-teaser-title"
                className="mt-3 font-serif text-4xl leading-tight tracking-tight text-amber-900 md:text-5xl"
              >
                Presentes <br />
                <span className="italic">com afeto</span>
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-stone-600 md:text-lg">
                Sua presença já é o nosso maior presente, mas se você desejar
                contribuir com algo que celebre o início da nossa nova vida
                juntos, preparamos esta lista com muito carinho. Pague de forma
                simples e segura via{' '}
                <strong className="text-amber-800">Pix</strong>.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={token ? '/presentes?token=' + token : '/presentes'}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-7 py-3 text-sm font-medium uppercase tracking-wider text-white shadow-md transition hover:bg-amber-600 hover:shadow-lg"
                >
                  Ver presentes
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="order-1 md:order-2">
            <GiftsTeaserClient polaroids={polaroids} />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
    </section>
  )
}
