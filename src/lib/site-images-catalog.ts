export type SiteImageSection =
  | 'hero'
  | 'about'
  | 'gallery'
  | 'polaroids'
  | 'couple'
  | 'decorative'
  | 'venue'

export type SiteImageDef = {
  key: string
  section: SiteImageSection
  label: string
  description?: string
  fallback: string
  aspect?: 'square' | 'portrait' | 'landscape'
  hiddenFromAdmin?: boolean
}

export const DEFAULT_SITE_IMAGE_FALLBACK = '/images/texture-paper.jpg'

export const SITE_IMAGE_CATALOG: SiteImageDef[] = [
  {
    key: 'hero-bg',
    section: 'hero',
    label: 'Capa principal',
    fallback: '/images/hero-bg.jpg',
    aspect: 'landscape',
  },

  {
    key: 'about-1',
    section: 'about',
    label: 'Sobre nós — Foto 1',
    fallback: '/images/about/about-1.jpg',
    aspect: 'portrait',
  },
  {
    key: 'about-2',
    section: 'about',
    label: 'Sobre nós — Foto 2',
    fallback: '/images/about/about-2.jpg',
    aspect: 'portrait',
  },
  {
    key: 'about-3',
    section: 'about',
    label: 'Sobre nós — Foto 3',
    fallback: '/images/about/about-3.jpg',
    aspect: 'portrait',
  },

  // public/images/gallery/1.jpg ... 7.jpg
  ...Array.from({ length: 4 }, (_, i) => {
    const number = i + 1
    const padded = String(number).padStart(2, '0')

    return {
      key: `gallery-${padded}`,
      section: 'gallery' as const,
      label: `Galeria — Foto ${number}`,
      fallback: `/images/gallery/${number}.jpg`,
      aspect: 'portrait' as const,
    }
  }),

  {
    key: 'polaroid-1',
    section: 'polaroids',
    label: 'Polaroid 1',
    fallback: '/images/polaroids/eb-1.jpg',
    aspect: 'square',
  },
  {
    key: 'polaroid-2',
    section: 'polaroids',
    label: 'Polaroid 2',
    fallback: '/images/polaroids/eb-2.jpg',
    aspect: 'square',
  },
  {
    key: 'polaroid-3',
    section: 'polaroids',
    label: 'Polaroid 3',
    fallback: '/images/polaroids/eb-3.jpg',
    aspect: 'square',
  },

  {
    key: 'couple-main',
    section: 'couple',
    label: 'Foto principal do casal',
    fallback: '/images/couple-main.jpg',
    aspect: 'portrait',
  },
  {
    key: 'couple-emotion',
    section: 'couple',
    label: 'Casal — emoção',
    fallback: '/images/couple-emotion.jpg',
    aspect: 'portrait',
  },
  {
    key: 'couple-forever',
    section: 'couple',
    label: 'Casal — para sempre',
    fallback: '/images/couple-forever.jpg',
    aspect: 'portrait',
  },

  {
    key: 'venue',
    section: 'venue',
    label: 'Local',
    fallback: '/images/venue.jpg',
    aspect: 'landscape',
  },

  {
    key: 'monogram-eb',
    section: 'decorative',
    label: 'Monograma E&B',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'leaf-branch',
    section: 'decorative',
    label: 'Ramo decorativo',
    fallback: '/images/leaf-branch.png',
    aspect: 'landscape',
  },
  {
    key: 'wreath-top',
    section: 'decorative',
    label: 'Coroa topo',
    fallback: '/images/wreath-top.png',
    aspect: 'landscape',
  },
  {
    key: 'wreath-bottom',
    section: 'decorative',
    label: 'Coroa base',
    fallback: '/images/wreath-bottom.png',
    aspect: 'landscape',
  },
  {
    key: 'texture-paper',
    section: 'decorative',
    label: 'Textura de papel',
    fallback: '/images/texture-paper.jpg',
    aspect: 'landscape',
  },
]

export const SECTION_LABELS: Record<SiteImageSection, string> = {
  hero: 'Capa',
  about: 'Sobre Nós',
  gallery: 'Galeria',
  polaroids: 'Polaroids',
  couple: 'Casal',
  venue: 'Local',
  decorative: 'Decorativos',
}

export function normalizeSiteImageKey(key: string): string {
  // Allows both "gallery-1" and "gallery-01"
  const galleryMatch = key.match(/^gallery-(\d+)$/)

  if (galleryMatch) {
    const number = Number(galleryMatch[1])
    if (!Number.isNaN(number)) {
      return `gallery-${String(number).padStart(2, '0')}`
    }
  }

  return key
}

export function getCatalogByKey(key: string): SiteImageDef | undefined {
  const normalized = normalizeSiteImageKey(key)
  return SITE_IMAGE_CATALOG.find((item) => item.key === normalized)
}

export function getFallback(key: string): string {
  return getCatalogByKey(key)?.fallback ?? DEFAULT_SITE_IMAGE_FALLBACK
}

export function getLabel(key: string): string {
  return getCatalogByKey(key)?.label ?? 'Imagem do casamento'
}
