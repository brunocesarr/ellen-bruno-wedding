import {
  getGuestManagerContextUseCase,
  touchGuestManagerLinkUseCase,
  updateManagedGuestUseCase,
} from '@/src/application/use-cases/guest-manager-links/guest-manager-access.use-case'
import { getPublicContainer } from '@/src/di/public-container'
import { handle } from '@/src/interface-adapters/controllers/_handle'

export async function getGuestManagerContextController(token: unknown) {
  return handle(async () => {
    const c = getPublicContainer()
    return await getGuestManagerContextUseCase({
      guestManagerLinksRepo: c.guestManagerLinksRepo,
      guestsRepo: c.guestsRepo,
    })(token)
  })
}

export async function updateManagedGuestController(input: unknown) {
  return handle(async () => {
    const c = getPublicContainer()
    return await updateManagedGuestUseCase({
      guestManagerLinksRepo: c.guestManagerLinksRepo,
      guestsRepo: c.guestsRepo,
    })(input)
  })
}

export async function touchGuestManagerLinkController(token: unknown) {
  return handle(async () => {
    const c = getPublicContainer()
    return await touchGuestManagerLinkUseCase({
      guestManagerLinksRepo: c.guestManagerLinksRepo,
    })(token)
  })
}
