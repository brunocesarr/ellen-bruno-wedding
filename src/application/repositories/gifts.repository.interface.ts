import type {
  CreateGiftInput,
  Gift,
  UpdateGiftInput,
} from '@/src/entities/models/gift'

export type ReserveGiftParams = {
  id: string
  name: string
  message?: string
  amount?: number
  contributionId: string
}

export type ReserveGiftResult = { gift: Gift; contributionId: string }

export interface IGiftsRepository {
  list(): Promise<Gift[]>
  getById(id: string): Promise<Gift | null>
  reserve(params: ReserveGiftParams): Promise<ReserveGiftResult>
  create(data: CreateGiftInput): Promise<Gift>
  update(data: UpdateGiftInput): Promise<Gift>
  delete(id: string): Promise<void>
}
