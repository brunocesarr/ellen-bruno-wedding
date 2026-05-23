import type { IPixService } from '@/src/application/services/pix.service.interface'

export function generatePixQrUseCase(deps: { pixService: IPixService }) {
  return async (input: { amount: number; description: string }) =>
    deps.pixService.generateStaticQr(input)
}
