import { deleteSiteImageUseCase } from '@/src/application/use-cases/site-images/delete-site-image.use-case'
import { listSiteImagesAdminUseCase } from '@/src/application/use-cases/site-images/list-site-images-admin.use-case'
import { upsertSiteImageUseCase } from '@/src/application/use-cases/site-images/upsert-site-image.use-case'
import { getContainer } from '@/src/di/container'
import {
  toSiteImageViewModel,
  type SiteImageViewModel,
} from '@/src/interface-adapters/view-models/site-image.view-model'
import { handle } from '../_handle'

export async function listSiteImagesAdminController(): Promise<
  { ok: true; data: SiteImageViewModel[] } | { ok: false; error: string }
> {
  const c = await getContainer()
  return handle(async () => {
    const list = await listSiteImagesAdminUseCase(c)()
    return list.map((m) => toSiteImageViewModel(m, c.storageRepo))
  })
}

export async function upsertSiteImageController(input: unknown) {
  const c = await getContainer()
  return handle(async () => {
    const result = await upsertSiteImageUseCase(c)(input)
    return toSiteImageViewModel(result, c.storageRepo)
  })
}

export async function deleteSiteImageController(
  key: string,
  mode: 'clear' | 'delete' = 'clear'
) {
  const c = await getContainer()
  return handle(() => deleteSiteImageUseCase(c)(key, mode))
}
