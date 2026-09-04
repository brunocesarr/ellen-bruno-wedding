import { incrementGiftViewAction } from '@/app/(public)/_actions/gifts.actions'
import { GiftDetailHero } from '@/components/gifts/GiftDetailHero'
import { GiftPaymentSection } from '@/components/gifts/GiftPaymentSection'
import { getContainer } from '@/src/di/container'
import { GiftNotFoundError } from '@/src/entities/errors/gifts'
import {
  CARD_PAYMENT_PROVIDER_LABELS,
  getActiveCardPaymentProvider,
  isCardPaymentFeatureEnabled,
} from '@/src/infrastructure/services/get-card-payment-service'
import { getGiftDetailController } from '@/src/interface-adapters/controllers/gifts/get-gift-detail.controller'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { after } from 'next/server'

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

  after(async () => {
    await incrementGiftViewAction(giftView.id)
  })

  const cardProviderLabel =
    CARD_PAYMENT_PROVIDER_LABELS[getActiveCardPaymentProvider()]
  const cardPaymentFeatureEnabled = isCardPaymentFeatureEnabled()

  return (
    <main className="bg-cream">
      <GiftDetailHero gift={giftView} token={token} />
      <GiftPaymentSection
        giftId={reservation.giftId}
        kind={giftView.kind}
        price={giftView.price}
        minAmount={giftView.minAmount}
        suggestedAmounts={giftView.suggestedAmounts}
        goalAmount={giftView.goalAmount}
        confirmedTotal={giftView.confirmedTotal}
        contributorCount={giftView.contributorCount}
        progressPct={giftView.progressPct}
        amountLabel={giftView.amountLabel}
        qrImage={pix?.qrImage ?? null}
        brCode={pix?.brCode ?? null}
        isReserved={reservation.isReserved}
        reservedByName={reservation.reservedByName}
        reservedMessage={reservation.reservedMessage}
        cardProviderLabel={cardProviderLabel}
        cardPaymentFeatureEnabled={cardPaymentFeatureEnabled}
        paymentLink={giftView.paymentLink}
      />
    </main>
  )
}
