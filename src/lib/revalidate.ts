import { revalidatePath } from 'next/cache'

type PathSpec = string | readonly [string, 'page' | 'layout']

const GROUPS = {
  guests: ['/admin', '/admin/convidados', '/admin/resumo'],
  gifts: ['/admin', '/admin/presentes', '/presentes', '/invite/full', '/'],
  messages: ['/admin', '/admin/mensagens', '/admin/resumo'],
  siteImages: [['/', 'layout'] as const, '/admin/imagens'],
  invite: [
    ['/invite/full', 'page'] as const,
    '/admin/convidados',
    '/admin',
    '/admin/resumo',
  ],
  rsvpRequests: [
    ['/admin', 'layout'] as const,
    '/admin/solicitacoes',
    '/admin/convidados',
    '/admin/resumo',
  ],
  inviteLinks: [['/invite/full', 'page'] as const, '/admin/solicitacoes'],
  expenses: ['/admin', '/admin/despesas'],
} as const satisfies Record<string, readonly PathSpec[]>

export type RevalidationGroup = keyof typeof GROUPS

export function revalidateGroup(group: RevalidationGroup): void {
  for (const spec of GROUPS[group]) {
    if (typeof spec === 'string') revalidatePath(spec)
    else revalidatePath(spec[0], spec[1])
  }
}
