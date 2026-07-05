'use client'

import Image from 'next/image'
import { forwardRef } from 'react'

type Props = {
  guestName?: string
  date?: string
  location?: string
  photoUrl?: string
}

export const InvitationCard = forwardRef<HTMLDivElement, Props>(
  function InvitationCard(
    {
      guestName,
      date = '06 . 12 . 2026',
      location = 'Recife · PE',
      photoUrl = '/images/couple.jpg',
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        style={{ width: 1080, height: 1350 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#fdf8f3] via-[#f6ead9] to-[#e8d5b7] font-serif text-stone-800"
      >
        <svg
          className="absolute inset-0 h-full w-full opacity-20"
          viewBox="0 0 1080 1350"
          aria-hidden
        >
          <circle cx="100" cy="120" r="180" fill="#c9a96a" />
          <circle cx="980" cy="1230" r="220" fill="#b8946d" />
        </svg>

        <div className="relative z-10 flex h-full flex-col items-center justify-between p-20 text-center">
          <p className="tracking-[0.5em] text-sm uppercase text-stone-600">
            Save the Date
          </p>

          <div className="relative h-[560px] w-[560px] overflow-hidden rounded-full border-8 border-white shadow-2xl">
            <Image
              src={photoUrl}
              alt=""
              fill
              sizes="560px"
              className="object-cover"
              priority
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-7xl italic">
              Ellen <span className="text-amber-700">&</span> Bruno
            </h1>
            {guestName && (
              <p className="text-2xl text-stone-700">
                Convidam{' '}
                <span className="italic font-semibold">{guestName}</span>
              </p>
            )}
            <div className="mx-auto h-px w-32 bg-amber-700/60" />
            <p className="text-3xl tracking-[0.3em]">{date}</p>
            <p className="text-xl text-stone-600">{location}</p>
          </div>

          <p className="text-sm text-stone-500">
            ellen-bruno-wedding.netlify.app
          </p>
        </div>
      </div>
    )
  }
)
