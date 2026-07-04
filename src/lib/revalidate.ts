import { revalidatePath } from 'next/cache'

/** A path to revalidate, optionally with the `type` argument of `revalidatePath`. */
type PathSpec = string | readonly [string, 'page' | 'layout']

/**
 * Single source of truth for which paths each mutation invalidates.
 * Grouped by the domain the mutation touches so actions never hardcode paths.
 */
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
} as const satisfies Record<string, readonly PathSpec[]>

export type RevalidationGroup = keyof typeof GROUPS

/** Revalidates every path registered for the given group. */
export function revalidateGroup(group: RevalidationGroup): void {
  for (const spec of GROUPS[group]) {
    if (typeof spec === 'string') revalidatePath(spec)
    else revalidatePath(spec[0], spec[1])
  }
}
