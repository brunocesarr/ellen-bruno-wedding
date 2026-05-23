import { listGiftsController } from '@/src/interface-adapters/controllers/gifts/list-gifts.controller'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 60
export const metadata = { title: 'Lista de presentes · Ellen & Bruno' }

export default async function GiftsPage() {
  const gifts = await listGiftsController()
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-8 text-3xl font-serif">Lista de presentes</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {gifts.map((g) => (
          <Link
            key={g.id}
            href={`/presentes/${g.id}`}
            className="group overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg"
          >
            <div className="relative aspect-[4/3] bg-slate-100">
              {g.imageUrl && (
                <Image
                  src={g.imageUrl}
                  alt={g.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="eager"
                  className="object-cover"
                />
              )}
              {g.isReserved && (
                <span className="absolute right-2 top-2 rounded-full bg-amber-500 px-3 py-1 text-xs text-white">
                  Reservado
                </span>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium">{g.name}</h3>
              <p className="mt-1 text-lg font-semibold">
                R$ {g.price.toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
