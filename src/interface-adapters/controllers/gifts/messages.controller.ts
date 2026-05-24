import { listMessagesUseCase } from '@/src/application/use-cases/gifts/list-messages.use-case'
import { markAsThankedUseCase } from '@/src/application/use-cases/gifts/mark-as-thanked.use-case'
import { getContainer } from '@/src/di/container'
import {
  toMessageViewModel,
  type MessageViewModel,
} from '@/src/interface-adapters/view-models/message.view-model'
import { handle } from '../_handle'

export async function listMessagesController(): Promise<
  { ok: true; data: MessageViewModel[] } | { ok: false; error: string }
> {
  const c = await getContainer()
  return handle(async () => {
    const list = await listMessagesUseCase(c)()
    return list.map((m) => toMessageViewModel(m, c.storageRepo))
  })
}

export async function markAsThankedController(giftId: string) {
  const c = await getContainer()
  return handle(() => markAsThankedUseCase(c)(giftId))
}
