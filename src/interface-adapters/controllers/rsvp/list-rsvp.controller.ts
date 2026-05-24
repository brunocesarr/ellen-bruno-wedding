import { listRsvpUseCase } from '@/src/application/use-cases/rsvp/list-rsvps.use-case'
import { getContainer } from '@/src/di/container'
import {
  toRsvpViewModel,
  type RsvpViewModel,
} from '@/src/interface-adapters/view-models/rsvp.view-model'
import { handle } from '../_handle'

export async function listRsvpController(): Promise<
  { ok: true; data: RsvpViewModel[] } | { ok: false; error: string }
> {
  const c = await getContainer()
  return handle(async () => {
    const list = await listRsvpUseCase(c)()
    return list.map(toRsvpViewModel)
  })
}
