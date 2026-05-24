import { Reveal } from '@/components/ui/Reveal'
import { getOrderedSiteImages } from '@/src/lib/get-site-image'
import { GalleryGrid } from './GalleryGrid'

const GALLERY_KEYS = [
  'gallery-01',
  'gallery-02',
  'gallery-03',
  'gallery-04',
] as const

export async function GallerySection() {
  const photos = await getOrderedSiteImages(GALLERY_KEYS)

  return (
    <section
      id="galeria"
      className="bg-white py-20 md:py-28"
      aria-labelledby="gallery-title"
    >
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-amber-700/80">
            Memórias
          </p>
          <h2
            id="gallery-title"
            className="mt-3 font-serif text-4xl tracking-[0.05em] text-amber-900 md:text-5xl"
          >
            GALERIA
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-stone-500">
            Alguns momentos que escolhemos guardar — e dividir com vocês.
          </p>
        </Reveal>

        <GalleryGrid photos={photos} />
      </div>
    </section>
  )
}
