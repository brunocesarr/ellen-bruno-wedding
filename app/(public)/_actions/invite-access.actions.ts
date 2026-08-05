'use server'

import type { InviteAccess } from '@/src/entities/models/invite-link'
import { getInviteContextController } from '@/src/interface-adapters/controllers/guests/get-invite-context.controller'
import { getSharedInviteLinkController } from '@/src/interface-adapters/controllers/invite-links/get-shared-invite-link.controller'
import { touchInviteLinkController } from '@/src/interface-adapters/controllers/invite-links/touch-invite-link.controller'
import type { ActionResult } from '@/src/lib/server-action-result'

/**
 * Resolves any invite token to either a personalised guest context or a generic
 * shared link.
 *
 * The guest path is tried FIRST and is completely untouched, so personalised and
 * party links behave exactly as before. Only when that fails do we consider a
 * shareable token — which means the shared link can never shadow a real guest.
 */
export async function resolveInviteAccessAction(
  token: string
): Promise<ActionResult<InviteAccess>> {
  const guestResult = await getInviteContextController(token)
  if (guestResult.ok) {
    return {
      ok: true,
      data: {
        kind: 'guest',
        guest: guestResult.data.guest,
        partyMembers: guestResult.data.partyMembers,
      },
    }
  }

  const sharedResult = await getSharedInviteLinkController(token)
  if (sharedResult.ok) {
    return { ok: true, data: { kind: 'shared', link: sharedResult.data } }
  }

  return { ok: false, error: 'Convite inválido' }
}

/** Best-effort visit counter. Schedule with `after()`; never await in render. */
export async function touchInviteLinkAction(token: string) {
  return touchInviteLinkController(token)
}
