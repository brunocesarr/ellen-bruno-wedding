import type { PixQr } from '@/src/entities/models/pix'

export interface IPixService {
  generateStaticQr(input: {
    amount: number
    description: string
  }): Promise<PixQr>
}
