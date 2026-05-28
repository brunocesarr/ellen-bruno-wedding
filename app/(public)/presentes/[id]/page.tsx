import { GiftDetailHero } from '@/components/gifts/GiftDetailHero'
import { GiftPaymentSection } from '@/components/gifts/GiftPaymentSection'
import { getGiftUseCase } from '@/src/application/use-cases/gifts/get-gift.use-case'
import { generatePixQrUseCase } from '@/src/application/use-cases/pix/generate-pix-qr.use-case'
import { getContainer } from '@/src/di/container'
import { GiftNotFoundError } from '@/src/entities/errors/gifts'
import { toGiftViewModel } from '@/src/interface-adapters/view-models/gift.view-model'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; token?: string }>
}): Promise<Metadata> {
  const { id } = await params
  const { giftsRepo } = await getContainer()
  const gift = await giftsRepo.getById(id)
  return {
    title: gift
      ? `${gift.name} · Lista de presentes`
      : 'Presente não encontrado',
  }
}

export default async function GiftDetailPage({
  params,
}: {
  params: Promise<{ id: string; token?: string }>
}) {
  const { id, token } = await params
  const { giftsRepo, pixService, storageRepo } = await getContainer()

  let gift
  try {
    gift = await getGiftUseCase({ giftsRepo })(id)
  } catch (e) {
    if (e instanceof GiftNotFoundError) notFound()
    throw e
  }

  const pix = await generatePixQrUseCase({ pixService })({
    amount: gift.price,
    description: `Presente: ${gift.name}`,
  })

  const giftView = toGiftViewModel(
    { ...gift, status: gift.isReserved ? 'reserved' : 'pending' },
    storageRepo
  )

  console.log('GiftDetailPage render:', { id, token })

  return (
    <main className="bg-cream">
      <GiftDetailHero gift={giftView} token={token} />
      <GiftPaymentSection
        giftId={gift.id}
        qrImage={pix.qrImage}
        brCode={pix.brCode}
        isReserved={gift.isReserved}
        reservedByName={gift.reservedByName}
        reservedMessage={gift.reservedMessage}
      />
    </main>
  )
}
