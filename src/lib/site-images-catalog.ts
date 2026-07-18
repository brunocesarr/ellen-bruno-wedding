export type SiteImageSection =
  | 'hero'
  | 'about'
  | 'gallery'
  | 'polaroids'
  | 'couple'
  | 'decorative'
  | 'venue'
  | 'journey'

export type SiteImageDef = {
  key: string
  section: SiteImageSection
  label: string
  description?: string
  fallback: string
  aspect?: 'square' | 'portrait' | 'landscape'
  hiddenFromAdmin?: boolean
}

export const DEFAULT_SITE_IMAGE_FALLBACK = '/images/monogram-eb.png'

export const SECTION_LABELS: Record<SiteImageSection, string> = {
  hero: 'Capa',
  about: 'Sobre Nós',
  gallery: 'Galeria',
  polaroids: 'Polaroids',
  couple: 'Casal',
  venue: 'Local',
  decorative: 'Decorativos',
  journey: 'Nossa Jornada',
}

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
    fallback: '/images/monogram-eb.png',
    aspect: 'portrait',
  },
  {
    key: 'about-2',
    section: 'about',
    label: 'Sobre nós — Foto 2',
    fallback: '/images/monogram-eb.png',
    aspect: 'portrait',
  },
  {
    key: 'about-3',
    section: 'about',
    label: 'Sobre nós — Foto 3',
    fallback: '/images/monogram-eb.png',
    aspect: 'portrait',
  },
  ...Array.from({ length: 4 }, (_, i) => {
    const number = i + 1
    const padded = String(number).padStart(2, '0')
    return {
      key: `gallery-${padded}`,
      section: 'gallery' as const,
      label: `Galeria — Foto ${number}`,
      fallback: '/images/monogram-eb.png',
      aspect: 'portrait' as const,
    }
  }),
  {
    key: 'polaroid-1',
    section: 'polaroids',
    label: 'Polaroid 1',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'polaroid-2',
    section: 'polaroids',
    label: 'Polaroid 2',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'polaroid-3',
    section: 'polaroids',
    label: 'Polaroid 3',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'couple-main',
    section: 'couple',
    label: 'Foto principal do casal',
    fallback: '/images/monogram-eb.png',
    aspect: 'portrait',
  },
  {
    key: 'couple-emotion',
    section: 'couple',
    label: 'Casal — emoção',
    fallback: '/images/monogram-eb.png',
    aspect: 'portrait',
  },
  {
    key: 'couple-forever',
    section: 'couple',
    label: 'Casal — para sempre',
    fallback: '/images/monogram-eb.png',
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

  // --- Jornada (Nossa Jornada) ---------------------------------------
  {
    key: 'journey-first-kiss',
    section: 'journey',
    label: 'Jornada — O começo de tudo',
    fallback: '/images/monogram-eb.png',
    aspect: 'landscape',
  },
  {
    key: 'journey-trip-1',
    section: 'journey',
    label: 'Jornada — Primeira Viagem 1',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'journey-trip-2',
    section: 'journey',
    label: 'Jornada — Primeira Viagem 2',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'journey-trip-3',
    section: 'journey',
    label: 'Jornada — Primeira Viagem 3',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'journey-proposal',
    section: 'journey',
    label: 'Jornada — Voo de Balão e o Sim 1',
    fallback: '/images/monogram-eb.png',
    aspect: 'landscape',
  },
  {
    key: 'journey-big-day',
    section: 'journey',
    label: 'Jornada — O Casamento',
    fallback: '/images/monogram-eb.png',
    aspect: 'landscape',
  },
  {
    key: 'journey-primeiro-ano-1',
    section: 'journey',
    label: 'Jornada — Primeiro ano juntos 1',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'journey-primeiro-ano-2',
    section: 'journey',
    label: 'Jornada — Primeiro ano juntos 2',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'journey-festival-sertanejo',
    section: 'journey',
    label: 'Jornada — Primeiro Festival Sertanejo',
    fallback: '/images/monogram-eb.png',
    aspect: 'landscape',
  },
  {
    key: 'journey-trotao',
    section: 'journey',
    label: 'Jornada — Primeiro Trotão',
    fallback: '/images/monogram-eb.png',
    aspect: 'landscape',
  },
  {
    key: 'journey-carnaval',
    section: 'journey',
    label: 'Jornada — Carnaval juntos',
    fallback: '/images/monogram-eb.png',
    aspect: 'landscape',
  },
  {
    key: 'journey-torre-eiffel-1',
    section: 'journey',
    label: 'Jornada — Torre Eiffel 1',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'journey-torre-eiffel-2',
    section: 'journey',
    label: 'Jornada — Torre Eiffel 2',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'journey-ato-de-amor-1',
    section: 'journey',
    label: 'Jornada — Um ato de amor 1 (Marley)',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'journey-ato-de-amor-2',
    section: 'journey',
    label: 'Jornada — Um ato de amor 2 (Marley)',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'journey-ouro-preto-1',
    section: 'journey',
    label: 'Jornada — Ano Novo em Ouro Preto 1',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'journey-ouro-preto-2',
    section: 'journey',
    label: 'Jornada — Ano Novo em Ouro Preto 2',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'journey-ouro-preto-3',
    section: 'journey',
    label: 'Jornada — Ano Novo em Ouro Preto 3',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'journey-balao-2',
    section: 'journey',
    label: 'Jornada — Voo de Balão e o Sim 2',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'journey-balao-3',
    section: 'journey',
    label: 'Jornada — Voo de Balão e o Sim 3',
    fallback: '/images/monogram-eb.png',
    aspect: 'square',
  },
  {
    key: 'journey-corrida-de-rua',
    section: 'journey',
    label: 'Jornada — Primeira corrida de rua',
    fallback: '/images/monogram-eb.png',
    aspect: 'landscape',
  },
]

export function normalizeSiteImageKey(key: string): string {
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
