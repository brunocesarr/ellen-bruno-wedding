import type { IGiftsRepository } from '@/src/application/repositories/gifts.repository.interface'
import type { IStorageRepository } from '@/src/application/repositories/storage.repository.interface'
import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { UnauthenticatedError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'
import {
  CreateGiftInputSchema,
  UpdateGiftInputSchema,
} from '@/src/entities/models/gift'

type Deps = {
  giftsRepo: IGiftsRepository
  storageRepo: IStorageRepository
  authService: IAuthService
}

export function createGiftUseCase(d: Deps) {
  return async (raw: unknown) => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()
    const result = CreateGiftInputSchema.safeParse(raw)
    if (!result.success) throw new ValidationError(result.error.flatten())
    return d.giftsRepo.create({
      name: result.data.name,
      description: result.data.description ?? null,
      price: result.data.price,
      imagePath: result.data.imagePath ?? null,
    } as any)
  }
}

export function updateGiftUseCase(d: Deps) {
  return async (raw: unknown) => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()
    const result = UpdateGiftInputSchema.safeParse(raw)
    if (!result.success) throw new ValidationError(result.error.flatten())
    return d.giftsRepo.update(result.data)
  }
}

export function deleteGiftUseCase(d: Deps) {
  return async (id: string) => {
    if (!(await d.authService.getCurrentUser()))
      throw new UnauthenticatedError()
    const gift = await d.giftsRepo.getById(id)
    if (gift?.imagePath) {
      try {
        await d.storageRepo.remove(gift.imagePath)
      } catch {}
    }
    return d.giftsRepo.delete(id)
  }
}
