import { PixQrCode } from '@/components/gifts/PixQrCode'
import { ReserveGiftForm } from '@/components/gifts/ReserveGiftForm'
import { getGiftUseCase } from '@/src/application/use-cases/gifts/get-gift.use-case'
import { generatePixQrUseCase } from '@/src/application/use-cases/pix/generate-pix-qr.use-case'
import { getContainer } from '@/src/di/container'
import { GiftNotFoundError } from '@/src/entities/errors/gifts'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export default async function GiftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
  const imageUrl = gift.imagePath
    ? storageRepo.getPublicUrl(gift.imagePath, { width: 1000, quality: 80 })
    : null

  return (
    <main className="mx-auto max-w-3xl p-6">
      {imageUrl && (
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
          <Image
            src={imageUrl}
            alt={gift.name}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            loading="eager"
            priority
          />
        </div>
      )}
      <h1 className="mt-6 font-serif text-3xl">{gift.name}</h1>
      {gift.description && (
        <p className="mt-2 text-slate-600">{gift.description}</p>
      )}
      <p className="mt-4 text-2xl font-semibold">R$ {gift.price.toFixed(2)}</p>

      {gift.isReserved ? (
        <p className="mt-6 rounded-xl bg-amber-50 p-4 text-amber-900">
          Este presente já foi reservado por outro convidado. Veja outras
          opções! 💝
        </p>
      ) : (
        <section className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-3 font-medium">Pague via Pix</h2>
            <PixQrCode qrImage={pix.qrImage} brCode={pix.brCode} />
          </div>
          <div>
            <h2 className="mb-3 font-medium">Já presenteou?</h2>
            <p className="text-sm text-slate-600">
              Marque como reservado para que outros convidados saibam.
            </p>
            <ReserveGiftForm giftId={gift.id} />
          </div>
        </section>
      )}
    </main>
  )
}
