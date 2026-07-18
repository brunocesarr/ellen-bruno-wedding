// Types unchanged — preserved from the original file
export type JourneyLayout = 'photo-caption' | 'text' | 'polaroids'

export type JourneyPhoto = {
  /** A key registered in SITE_IMAGE_CATALOG. */
  key: string
  /** Optional handwritten-style caption printed under a polaroid. */
  caption?: string
  /** Tilt direction for the polaroid layout. Alternates automatically if omitted. */
  tilt?: 'left' | 'right'
}

/** One leaf of a book. */
export type JourneyPage = {
  id: string
  layout: JourneyLayout
  /** Optional sub-heading shown above the content (handy for multi-page books). */
  heading?: string
  /** Caption (photo-caption) or the paragraph body (text / polaroids intro). */
  body?: string
  /** Photos to show. Empty/omitted for the 'text' layout. */
  photos?: JourneyPhoto[]
}

/** One step of the story = one book on the shelf. */
export type JourneyBookDef = {
  id: string
  /** e.g. "Capítulo 1" — small eyebrow on the cover. */
  chapter: string
  /** e.g. "O primeiro beijo". */
  title: string
  /** e.g. "2019" or "24 de Outubro, 2026". Optional. */
  dateLabel?: string
  /** Spine colour on the shelf. */
  spineColor: 'terracotta' | 'sage' | 'ocean' | 'blush' | 'cream'
  pages: JourneyPage[]
}

export type ResolvedJourneyPhoto = JourneyPhoto & {
  src: string
  fallback: string
  alt: string
}

export type ResolvedJourneyPage = Omit<JourneyPage, 'photos'> & {
  photos: ResolvedJourneyPhoto[]
}

export type ResolvedJourneyBook = Omit<JourneyBookDef, 'pages'> & {
  pages: ResolvedJourneyPage[]
}

export type ShelfDecorBook = {
  id: string
  title: string
  color: 'sage' | 'ocean' | 'cream' | 'terracotta' | 'blush'
  height: number
}

// -----------------------------------------------------------------------
// JOURNEY_BOOKS — 14 chapters, in the order requested
// -----------------------------------------------------------------------
export const JOURNEY_BOOKS: JourneyBookDef[] = [
  {
    id: 'comeco-de-tudo',
    chapter: 'Capítulo 1',
    title: 'O começo',
    dateLabel: '24 de Abril, 2016',
    spineColor: 'terracotta',
    pages: [
      {
        id: 'comeco-de-tudo-1',
        layout: 'photo-caption',
        body: 'Um dia comum se tornou o primeiro capítulo da nossa história. Sem saber, ali começava tudo.',
        photos: [{ key: 'journey-first-kiss', tilt: 'right' }],
      },
    ],
  },
  {
    id: 'primeiro-natal-juntos',
    chapter: 'Capítulo 2',
    title: 'Primeiro Natal',
    dateLabel: 'Dezembro, 2016',
    spineColor: 'sage',
    pages: [
      {
        id: 'primeiro-natal-juntos-1',
        layout: 'text',
        body: 'Nosso primeiro Natal a dois: as luzes na árvore brilhavam, mas nada brilhava tanto quanto a certeza de que aquele era só o começo de muitos.',
      },
    ],
  },
  {
    id: 'primeira-pascoa-juntos',
    chapter: 'Capítulo 3',
    title: 'Primeira Páscoa',
    dateLabel: 'Abril, 2017',
    spineColor: 'ocean',
    pages: [
      {
        id: 'primeira-pascoa-juntos-1',
        layout: 'text',
        body: 'Entre chocolates e risadas, celebramos nossa primeira Páscoa juntos — mais uma data simples que a gente transformou em memória bonita.',
      },
    ],
  },
  {
    id: 'primeiro-ano-juntos',
    chapter: 'Capítulo 4',
    title: 'Primeiro ano juntos',
    dateLabel: '24 de Abril, 2017',
    spineColor: 'blush',
    pages: [
      {
        id: 'primeiro-ano-juntos-1',
        layout: 'polaroids',
        body: 'Um ano se passou e o que sentíamos só cresceu. Aprendemos a nos completar, a rir das mesmas coisas e a sonhar o mesmo sonho.',
        photos: [
          { key: 'journey-primeiro-ano-1', tilt: 'left' },
          { key: 'journey-primeiro-ano-2', tilt: 'right' },
        ],
      },
    ],
  },
  {
    id: 'primeiro-festival-sertanejo-juntos',
    chapter: 'Capítulo 5',
    title: 'Festival Sertanejo',
    dateLabel: 'Maio, 2022',
    spineColor: 'cream',
    pages: [
      {
        id: 'primeiro-festival-sertanejo-juntos-1',
        layout: 'photo-caption',
        body: 'Poeira, música e a mão dela na minha (ou dele, na minha). Nosso primeiro festival sertanejo virou trilha sonora para muitos outros que viriam.',
        photos: [{ key: 'journey-festival-sertanejo', tilt: 'left' }],
      },
    ],
  },
  {
    id: 'primeira-viagem-juntos',
    chapter: 'Capítulo 6',
    title: 'Primeira Viagem',
    dateLabel: '10 de Julho, 2022',
    spineColor: 'terracotta',
    pages: [
      {
        id: 'primeira-viagem-juntos-1',
        layout: 'polaroids',
        body: 'Malas prontas, coração acelerado. Nossa primeira viagem juntos nos ensinou que qualquer lugar é mais bonito quando dividido com a pessoa certa.',
        photos: [{ key: 'journey-trip-1', tilt: 'left' }],
      },
      {
        id: 'primeira-viagem-juntos-2',
        layout: 'polaroids',
        body: 'Entre mapas, estradas e descobertas, percebemos que o destino era só um detalhe — o melhor da viagem era a companhia.',
        photos: [
          { key: 'journey-trip-2', tilt: 'right' },
          { key: 'journey-trip-3', tilt: 'left' },
        ],
      },
    ],
  },
  {
    id: 'primeiro-trotao-juntos',
    chapter: 'Capítulo 7',
    title: 'Trotão',
    dateLabel: 'Novembro, 2022',
    spineColor: 'sage',
    pages: [
      {
        id: 'primeiro-trotao-juntos-1',
        layout: 'photo-caption',
        body: 'Suor, música alta e muita gargalhada: nosso primeiro trotão foi a prova de que a gente sabe se divertir junto como ninguém.',
        photos: [{ key: 'journey-trotao', tilt: 'right' }],
      },
    ],
  },
  {
    id: 'carnaval-juntos',
    chapter: 'Capítulo 8',
    title: 'Carnaval',
    dateLabel: 'Fevereiro, 2023',
    spineColor: 'ocean',
    pages: [
      {
        id: 'carnaval-juntos-1',
        layout: 'photo-caption',
        body: 'Confete, purpurina e um samba no pé — nosso primeiro carnaval juntos ficou marcado por muita alegria e nenhum minuto de tédio.',
        photos: [{ key: 'journey-carnaval', tilt: 'left' }],
      },
    ],
  },
  {
    id: 'torre-eiffel',
    chapter: 'Capítulo 9',
    title: 'Visitando a Torre Uaiffel',
    dateLabel: '04 de Junho, 2023',
    spineColor: 'blush',
    pages: [
      {
        id: 'torre-eiffel-1',
        layout: 'polaroids',
        photos: [
          { key: 'journey-torre-eiffel-1', tilt: 'left' },
          { key: 'journey-torre-eiffel-2', tilt: 'right' },
        ],
      },
    ],
  },
  {
    id: 'um-ato-de-amor',
    chapter: 'Capítulo 10',
    title: 'Um ato de amor',
    dateLabel: '24 de Fevereiro, 2023',
    spineColor: 'cream',
    pages: [
      {
        id: 'um-ato-de-amor-1',
        layout: 'polaroids',
        body: 'Amor também se mostra em gestos silenciosos. Ao acolher o Marley, abrimos nossa casa e nosso coração para mais um membro da família.',
        photos: [
          { key: 'journey-ato-de-amor-1', tilt: 'left' },
          { key: 'journey-ato-de-amor-2', tilt: 'right' },
        ],
      },
    ],
  },
  {
    id: 'ano-novo-ouro-preto',
    chapter: 'Capítulo 11',
    title: 'Ano Novo em Ouro Preto',
    dateLabel: 'Dezembro, 2023',
    spineColor: 'terracotta',
    pages: [
      {
        id: 'ano-novo-ouro-preto-1',
        layout: 'polaroids',
        body: 'Entre ladeiras, igrejas históricas e fogos de artifício, recebemos um novo ano em Ouro Preto — e com ele, mais motivos para agradecer um pelo outro.',
        photos: [
          { key: 'journey-ouro-preto-1', tilt: 'left' },
          { key: 'journey-ouro-preto-2', tilt: 'right' },
          { key: 'journey-ouro-preto-3', tilt: 'left' },
        ],
      },
    ],
  },
  {
    id: 'voo-de-balao-e-o-sim',
    chapter: 'Capítulo 12',
    title: 'Voo de Balão e o Sim',
    dateLabel: '18 de Maio, 2024',
    spineColor: 'sage',
    pages: [
      {
        id: 'voo-de-balao-e-o-sim-1',
        layout: 'text',
        body: 'Voando entre nuvens e a luz dourada do amanhecer, o mundo parecia pequeno diante do que sentíamos. Foi lá, no alto, que tudo mudou.',
      },
      {
        id: 'voo-de-balao-e-o-sim-2',
        layout: 'polaroids',
        body: 'Com o coração batendo mais forte que o vento, veio a pergunta — e a resposta veio: sim, para sempre.',
        photos: [
          { key: 'journey-proposal', tilt: 'left' },
          { key: 'journey-balao-2', tilt: 'right' },
          { key: 'journey-balao-3', tilt: 'left' },
        ],
      },
    ],
  },
  {
    id: 'primeira-corrida-de-rua-nossa',
    chapter: 'Capítulo 13',
    title: 'Primeira corrida de rua nossa',
    dateLabel: '09 de Junho, 2024',
    spineColor: 'ocean',
    pages: [
      {
        id: 'primeira-corrida-de-rua-nossa-1',
        layout: 'photo-caption',
        body: 'Passo a passo, lado a lado. Nossa primeira corrida de rua provou que, seja qual for o percurso, a gente sempre chega junto na linha de chegada.',
        photos: [{ key: 'journey-corrida-de-rua' }],
      },
    ],
  },
  {
    id: 'o-casamento',
    chapter: 'Capítulo 14',
    title: 'O Casamento…',
    dateLabel: '24 de Outubro, 2026',
    spineColor: 'blush',
    pages: [
      {
        id: 'o-casamento-1',
        layout: 'photo-caption',
        body: 'De um começo despretensioso a um "sim" para a vida toda. Hoje escrevemos o capítulo mais bonito da nossa história: o nosso casamento.',
        photos: [{ key: 'journey-big-day' }],
      },
    ],
  },
]

// -----------------------------------------------------------------------
// Unchanged helper logic — auto-derives from JOURNEY_BOOKS above
// -----------------------------------------------------------------------
export const JOURNEY_IMAGE_KEYS = Array.from(
  new Set(
    JOURNEY_BOOKS.flatMap((b) =>
      b.pages.flatMap((p) => (p.photos ?? []).map((photo) => photo.key))
    )
  )
) as readonly string[]

export const SHELF_DECOR_BOOKS: ShelfDecorBook[] = [
  { id: 'cartas', title: 'Cartas', color: 'sage', height: 0.94 },
  { id: 'poemas', title: 'Poemas', color: 'ocean', height: 1 },
  { id: 'sonhos', title: 'Sonhos', color: 'cream', height: 0.88 },
  { id: 'cancoes', title: 'Canções', color: 'blush', height: 0.9 },
  { id: 'lugares', title: 'Lugares', color: 'sage', height: 0.99 },
  { id: 'memorias', title: 'Memórias', color: 'terracotta', height: 0.92 },
  { id: 'promessas', title: 'Promessas', color: 'ocean', height: 0.96 },
  { id: 'saudades', title: 'Saudades', color: 'blush', height: 0.85 },
  { id: 'risadas', title: 'Risadas', color: 'cream', height: 1.02 },
  { id: 'abracos', title: 'Abraços', color: 'sage', height: 0.9 },
  { id: 'segredos', title: 'Segredos', color: 'terracotta', height: 0.87 },
  { id: 'raizes', title: 'Raízes', color: 'ocean', height: 0.98 },
  { id: 'estradas', title: 'Estradas', color: 'blush', height: 0.93 },
  { id: 'eternidade', title: 'Eternidade', color: 'cream', height: 1.04 },
]
