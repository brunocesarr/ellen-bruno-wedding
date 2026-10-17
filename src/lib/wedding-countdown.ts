/** Days before the wedding at which the daily countdown starts. */
export const COUNTDOWN_START_DAYS = 14

const MS_PER_DAY = 86_400_000

/** Whole days from `today` to `weddingDate` (both "YYYY-MM-DD"); negative once passed. */
export function daysUntil(today: string, weddingDate: string): number {
  return Math.round((Date.parse(weddingDate) - Date.parse(today)) / MS_PER_DAY)
}

type DayCopy = { title: string; body: string }

// Specific copy for the final week; earlier days share a rotating pool.
const FINAL_WEEK: Record<number, DayCopy> = {
  0: {
    title: '🐶💍 HOJE É O DIA! 💍🐶',
    body: 'Hoje é o grande dia! Todos os cachorrinhos estão de gravata borboleta, abanando o rabo sem parar e prontos para o "sim"! 🎀🐾',
  },
  1: {
    title: '🐕 Falta 1 dia!',
    body: 'Amanhã é o casamento! O dog já separou a coleira de gala e não consegue dormir de tanta ansiedade. 🦴✨',
  },
  2: {
    title: '🐩 Faltam 2 dias!',
    body: 'Já deu até para ouvir o latido de felicidade lá do quintal. Hora de dar o último banho no pet (e em você também)! 🛁🐾',
  },
  3: {
    title: '🐾 Faltam 3 dias!',
    body: 'O rabinho não para de abanar! Confira o look, os sapatos e se a aliança está no lugar. 💍🦴',
  },
  4: {
    title: '🐕‍🦺 Faltam 4 dias!',
    body: 'Hora de farejar os últimos detalhes: lista de convidados, fornecedores e playlist. Nada passa batido pelo faro canino! 👃📋',
  },
  5: {
    title: '🦮 Faltam 5 dias!',
    body: 'Cinco patinhas (e um pouquinho mais) separam vocês do altar. Respirem fundo e bora passear pela lista de pendências! 🐾✅',
  },
  6: {
    title: '🐶 Faltam 6 dias!',
    body: 'Uma semana quase completa! O filhote aqui já está ensaiando o "au-au" de felicidade. 🎶🐾',
  },
  7: {
    title: '🐕 Falta 1 semana!',
    body: 'Sete dias para o grande dia! Hora de buscar o osso mais precioso: o "sim" de vocês. 🦴💕',
  },
}

const EARLIER: { emoji: string; body: string }[] = [
  {
    emoji: '🐶',
    body: 'Cada dia é um passeio a menos até o altar. Abane o rabinho, que o grande dia está chegando! 🐾',
  },
  {
    emoji: '🦴',
    body: 'Mais um dia, mais um petisco de felicidade! O amor está no ar, e o faro canino garante: vai ser lindo! 💕',
  },
  {
    emoji: '🐕',
    body: 'Au-au, bom dia, noivos! A matilha toda está torcendo por vocês. Falta pouco para a festa! 🎀',
  },
  {
    emoji: '🐩',
    body: 'Pata na estrada rumo ao altar! Um dia de cada vez, sempre com muito carinho e muitas lambeijas. 🥰',
  },
]

const pluralDays = (n: number) => (n === 1 ? '1 dia' : `${n} dias`)

/**
 * Builds the HTML (Telegram `parse_mode: HTML`) countdown message for the
 * given number of days left, or `null` when it's outside the countdown window
 * (too early, or the wedding has passed).
 */
export function buildWeddingCountdownMessage(params: {
  daysLeft: number
  couple: string
  displayDate: string
}): string | null {
  const { daysLeft, couple, displayDate } = params
  if (daysLeft < 0 || daysLeft > COUNTDOWN_START_DAYS) return null

  const earlier = EARLIER[daysLeft % EARLIER.length]!
  const copy: DayCopy = FINAL_WEEK[daysLeft] ?? {
    title: `${earlier.emoji} Faltam ${pluralDays(daysLeft)}!`,
    body: earlier.body,
  }

  return [
    `<b>${copy.title}</b>`,
    '',
    copy.body,
    '',
    `💒 ${couple} · ${displayDate}`,
  ].join('\n')
}
