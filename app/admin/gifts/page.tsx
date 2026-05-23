import { GiftFormDialog } from '@/components/admin/GiftFormDialog'
import { listGiftsController } from '@/src/interface-adapters/controllers/gifts/list-gifts.controller'
import Image from 'next/image'

export default async function AdminGiftsPage() {
  const gifts = await listGiftsController()
  return (
    <main className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-serif text-3xl">Presentes</h1>
        <GiftFormDialog />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gifts.map((g) => (
          <div key={g.id} className="rounded-xl border bg-white p-4">
            <div className="relative mb-3 aspect-video overflow-hidden rounded-lg bg-slate-100">
              {g.imageUrl && (
                <Image
                  src={g.imageUrl}
                  alt={g.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  loading="eager"
                  className="object-cover"
                />
              )}
            </div>
            <h3 className="font-medium">{g.name}</h3>
            <p className="text-sm text-slate-600">R$ {g.price.toFixed(2)}</p>
            <p className="mt-2 text-xs">
              {g.isReserved
                ? `🔒 Reservado por ${g.reservedByName}`
                : '🟢 Disponível'}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
