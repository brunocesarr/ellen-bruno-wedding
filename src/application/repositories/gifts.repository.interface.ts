import type { Gift } from '@/src/entities/models/gift'

export interface IGiftsRepository {
  list(): Promise<Gift[]>
  getById(id: string): Promise<Gift | null>
  reserve(id: string, name: string, email: string): Promise<Gift> // throws GiftAlreadyReservedError
  create(
    data: Omit<
      Gift,
      'id' | 'isReserved' | 'reservedByName' | 'reservedByEmail' | 'reservedAt'
    >
  ): Promise<Gift>
  update(id: string, data: Partial<Gift>): Promise<Gift>
  delete(id: string): Promise<void>
}
