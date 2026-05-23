import type {
  CreateGiftInput,
  Gift,
  UpdateGiftInput,
} from '@/src/entities/models/gift'

export interface IGiftsRepository {
  list(): Promise<Gift[]>
  getById(id: string): Promise<Gift | null>
  reserve(id: string, name: string, email: string): Promise<Gift>
  create(data: CreateGiftInput): Promise<Gift>
  update(data: UpdateGiftInput): Promise<Gift>
  delete(id: string): Promise<void>
}
