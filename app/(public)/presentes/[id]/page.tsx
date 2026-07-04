import { GiftDetailHero } from '@/components/gifts/GiftDetailHero'
import { GiftPaymentSection } from '@/components/gifts/GiftPaymentSection'
import { getContainer } from '@/src/di/container'
import { GiftNotFoundError } from '@/src/entities/errors/gifts'
import { getGiftDetailController } from '@/src/interface-adapters/controllers/gifts/get-gift-detail.controller'
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

  let detail
  try {
    detail = await getGiftDetailController(id)
  } catch (e) {
    if (e instanceof GiftNotFoundError) notFound()
    throw e
  }

  const { giftView, pix, reservation } = detail

  return (
    <main className="bg-cream">
      <GiftDetailHero gift={giftView} token={token} />
      <GiftPaymentSection
        giftId={reservation.giftId}
        qrImage={pix.qrImage}
        brCode={pix.brCode}
        isReserved={reservation.isReserved}
        reservedByName={reservation.reservedByName}
        reservedMessage={reservation.reservedMessage}
      />
    </main>
  )
}
