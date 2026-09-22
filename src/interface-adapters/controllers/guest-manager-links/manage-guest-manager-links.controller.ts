import {
  createGuestManagerLinkUseCase,
  listGuestManagerLinksUseCase,
  revokeAllGuestManagerLinksUseCase,
  revokeGuestManagerLinkUseCase,
} from '@/src/application/use-cases/guest-manager-links/manage-guest-manager-links.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function listGuestManagerLinksController() {
  return handle(async () => {
    const c = await getContainer()
    return await listGuestManagerLinksUseCase({
      authService: c.authService,
      guestManagerLinksRepo: c.guestManagerLinksRepo,
    })()
  })
}

export async function createGuestManagerLinkController(input: unknown = {}) {
  return handle(async () => {
    const c = await getContainer()
    return await createGuestManagerLinkUseCase({
      authService: c.authService,
      guestManagerLinksRepo: c.guestManagerLinksRepo,
    })(input)
  })
}

export async function revokeGuestManagerLinkController(input: unknown) {
  return handle(async () => {
    const c = await getContainer()
    return await revokeGuestManagerLinkUseCase({
      authService: c.authService,
      guestManagerLinksRepo: c.guestManagerLinksRepo,
    })(input)
  })
}

export async function revokeAllGuestManagerLinksController() {
  return handle(async () => {
    const c = await getContainer()
    return await revokeAllGuestManagerLinksUseCase({
      authService: c.authService,
      guestManagerLinksRepo: c.guestManagerLinksRepo,
    })()
  })
}
