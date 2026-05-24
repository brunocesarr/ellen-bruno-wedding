'use client'

import { motion } from 'motion/react'
import { PixQrCode } from './PixQrCode'
import { ReserveGiftForm } from './ReserveGiftForm'

type Props = {
  giftId: string
  qrImage: string
  brCode: string
  isReserved: boolean
  reservedByName?: string | null
  reservedMessage?: string | null
}

export function GiftPaymentSection({
  giftId,
  qrImage,
  brCode,
  isReserved,
  reservedByName,
  reservedMessage,
}: Props) {
  if (isReserved) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-3xl px-6 py-16"
      >
        <div className="rounded-3xl border border-sage/20 bg-sage/5 p-10 text-center">
          <p className="eyebrow text-sage">Já reservado</p>
          <h3 className="mt-3 font-display text-3xl text-terracotta">
            Este presente foi reservado com carinho 💕
          </h3>
          {reservedByName && (
            <p className="mt-3 text-ink-muted">
              Por <strong className="text-ink">{reservedByName}</strong>
            </p>
          )}
          {reservedMessage && (
            <blockquote className="accent mx-auto mt-6 max-w-md italic">
              &ldquo;{reservedMessage}&rdquo;
            </blockquote>
          )}
          <a href="/presentes" className="btn-ghost mt-8">
            Ver outros presentes
          </a>
        </div>
      </motion.section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
        {/* Pix QR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <header className="mb-6">
            <p className="eyebrow">Pagamento</p>
            <h2 className="heading-display mt-3 text-3xl md:text-4xl">
              Pague pelo Pix
            </h2>
            <p className="mt-3 text-ink-muted">
              Escaneie o QR Code ou copie o código abaixo. É rápido, seguro e
              gratuito 🤍
            </p>
          </header>
          <PixQrCode qrImage={qrImage} brCode={brCode} />
        </motion.div>

        {/* Optional reservation form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <header className="mb-12">
            <p className="eyebrow">Marcar como presenteado</p>
            <h2 className="heading-display mt-3 text-3xl md:text-4xl">
              Deixe um carinho
            </h2>
            <p className="mt-3 text-ink-muted">
              Opcional, mas adoraríamos saber que foi você 💕
            </p>
          </header>
          <ReserveGiftForm giftId={giftId} />
        </motion.div>
      </div>
    </section>
  )
}
