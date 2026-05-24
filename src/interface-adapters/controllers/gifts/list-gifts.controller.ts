import { listGiftsAdminUseCase } from '@/src/application/use-cases/gifts/list-gifts.use-case'
import { getContainer } from '@/src/di/container'
import {
  GiftViewModel,
  toGiftViewModel,
} from '../../view-models/gift.view-model'
import { handle } from '../_handle'

export async function listGiftsAdminController(): Promise<
  { ok: true; data: GiftViewModel[] } | { ok: false; error: string }
> {
  const c = await getContainer()
  return handle(async () => {
    const list = await listGiftsAdminUseCase(c)()
    return list.map((g) => toGiftViewModel(g, c.storageRepo))
  })
}
