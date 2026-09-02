'use client'

import { generateGiftPixAction } from '@/app/(public)/_actions/gifts.actions'
import type { GiftKind } from '@/src/entities/models/gift'
import { MIN_CARD_PAYMENT_AMOUNT } from '@/src/lib/constants'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { CardPaymentForm } from './CardPaymentForm'
import { PixQrCode } from './PixQrCode'
import { ReserveGiftForm } from './ReserveGiftForm'

type PaymentMethod = 'pix' | 'card'

type Props = {
  giftId: string
  kind: GiftKind
  /** Only set for fixed_item — open_item/fund amounts are chosen by the guest. */
  price: number | null
  minAmount: number | null
  suggestedAmounts: number[]
  goalAmount: number | null
  confirmedTotal: number
  contributorCount: number
  progressPct: number | null
  amountLabel: string
  qrImage: string | null
  brCode: string | null
  isReserved: boolean
  reservedByName?: string | null
  reservedMessage?: string | null
  /** Display name of whichever card provider is currently active — see
   *  getActiveCardPaymentProvider(). */
  cardProviderLabel: string
  /** See isCardPaymentFeatureEnabled() — the ENABLE_CARD_PAYMENT_TYPE flag. */
  cardPaymentFeatureEnabled: boolean
  /** Admin-set external checkout link (fixed_item only). When set, the guest
   *  is redirected there instead of the CardPaymentForm/provider checkout. */
  paymentLink: string | null
}

const brl = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function GiftPaymentSection({
  giftId,
  kind,
  price,
  minAmount,
  suggestedAmounts,
  goalAmount,
  confirmedTotal,
  contributorCount,
  progressPct,
  amountLabel,
  qrImage,
  brCode,
  isReserved,
  reservedByName,
  reservedMessage,
  cardProviderLabel,
  cardPaymentFeatureEnabled,
  paymentLink,
}: Props) {
  const isOpenAmount = kind !== 'fixed_item'

  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [amount, setAmount] = useState('')
  const [pix, setPix] = useState<{ qrImage: string; brCode: string } | null>(
    qrImage && brCode ? { qrImage, brCode } : null
  )
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // The amount the QR was actually built from. Editing the field after
  // generating must invalidate the QR, otherwise the guest could pay one amount
  // and have a different one recorded in the ledger.
  const [quotedAmount, setQuotedAmount] = useState<string | null>(null)

  // Number('') === 0 and Number(undefined) === NaN, so normalise and compare
  // > 0 rather than truthiness — rejects "," or other unparseable input too.
  const chargeAmount = Number(amount.replace(',', '.'))
  const hasValidAmount = Number.isFinite(chargeAmount) && chargeAmount > 0

  // Fixed_item's charge amount is the gift's own price; open_item/fund only
  // know it once the guest types one in, so eligibility can only be checked
  // once `amount` is non-empty and above the threshold.
  const cardChargeAmount = isOpenAmount ? chargeAmount : (price ?? 0)
  const hasQualifyingAmount = isOpenAmount
    ? hasValidAmount && cardChargeAmount > MIN_CARD_PAYMENT_AMOUNT
    : cardChargeAmount > MIN_CARD_PAYMENT_AMOUNT
  const cardAvailableNow = cardPaymentFeatureEnabled && hasQualifyingAmount

  function handleAmountChange(next: string) {
    setAmount(next)
    setError(null)
    if (quotedAmount !== null && next !== quotedAmount) {
      setPix(null)
      setQuotedAmount(null)
    }
  }

  function handleGenerate() {
    setError(null)
    const requested = amount

    startTransition(async () => {
      const result = await generateGiftPixAction({ giftId, amount: requested })

      if (!result.ok) {
        setPix(null)
        setQuotedAmount(null)
        setError(
          result.issues?.fieldErrors?.amount?.[0] ??
            result.error ??
            'Não foi possível gerar o Pix.'
        )
        return
      }

      setPix(result.data)
      setQuotedAmount(requested)
    })
  }

  // Funds are never "already reserved" — the controller only sets this for
  // fixed_item / open_item.
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
          <Link href="/presentes" className="btn-ghost mt-8">
            Ver outros presentes
          </Link>
        </div>
      </motion.section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      {cardPaymentFeatureEnabled && cardAvailableNow && (
        <div className="mb-10 flex flex-col items-center gap-2">
          <div className="inline-flex rounded-full border border-stone-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setMethod('pix')}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                method === 'pix'
                  ? 'bg-terracotta text-white'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Pix
            </button>
            <button
              type="button"
              onClick={() => cardAvailableNow && setMethod('card')}
              disabled={!cardAvailableNow}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                method === 'card'
                  ? 'bg-terracotta text-white'
                  : cardAvailableNow
                    ? 'text-ink-muted hover:text-ink'
                    : 'cursor-not-allowed text-ink-muted/40'
              }`}
            >
              Cartão
            </button>
          </div>

          {method === 'card' && (
            <p className="text-xs text-ink-muted">
              Pagamento por cartão disponível.
            </p>
          )}
        </div>
      )}

      {method === 'card' && cardPaymentFeatureEnabled ? (
        <div className="mx-auto max-w-xl">
          <header className="mb-8 text-center">
            <p className="eyebrow">Pagamento</p>
            <h2 className="heading-display mt-3 text-3xl md:text-4xl">
              Pague com cartão
            </h2>
            <p className="mt-3 text-ink-muted">
              {paymentLink
                ? 'Rápido e seguro 🤍'
                : `Rápido e seguro, direto pelo ${cardProviderLabel} 🤍`}
            </p>
          </header>

          {isOpenAmount && (
            <div className="mb-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              <div>
                <label
                  htmlFor="card-amount"
                  className="mb-1.5 block text-sm font-medium text-ink"
                >
                  Quanto você gostaria de contribuir?
                </label>

                <input
                  id="card-amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min={minAmount ?? 0.01}
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder={minAmount ? minAmount.toFixed(2) : '150,00'}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-stone-300 focus:border-terracotta"
                />

                {minAmount != null && (
                  <p className="mt-1 text-xs text-ink-muted">
                    Valor mínimo: {brl(minAmount)}
                  </p>
                )}
              </div>

              {suggestedAmounts.length > 0 && (
                <div>
                  <p className="mb-1.5 block text-sm font-medium text-ink">
                    Sugestões:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedAmounts.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleAmountChange(String(suggestion))}
                        className={`
                          rounded-full border px-4 py-1.5 text-sm transition
                          ${
                            amount === String(suggestion)
                              ? 'border-terracotta bg-terracotta/10 text-terracotta-dark'
                              : 'border-stone-200 text-ink-muted hover:border-terracotta/40'
                          }
                        `}
                      >
                        {brl(suggestion)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isOpenAmount && !hasQualifyingAmount ? (
            <div className="rounded-2xl border border-dashed border-stone-200 p-10 text-center text-sm text-ink-muted">
              {amount === ''
                ? 'Escolha um valor acima para continuar 🤍'
                : `Pagamento por cartão disponível para valores acima de ${brl(MIN_CARD_PAYMENT_AMOUNT)} 🤍`}
            </div>
          ) : paymentLink ? (
            <div className="space-y-6 rounded-3xl bg-white p-6 text-center shadow-sm md:p-8">
              <p className="text-sm text-ink-muted">
                Você será redirecionado para concluir o pagamento com segurança
                🔒
              </p>
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                Pagar com cartão 💳
              </a>
            </div>
          ) : (
            <CardPaymentForm
              giftId={giftId}
              amount={isOpenAmount ? amount : null}
              providerLabel={cardProviderLabel}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
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
                {isOpenAmount
                  ? 'Escolha o valor, gere o QR Code e pague pelo Pix 🤍'
                  : 'Escaneie o QR Code ou copie o código abaixo. É rápido, seguro e gratuito 🤍'}
              </p>
            </header>

            {/* Fund progress uses confirmedTotal only — money actually received. */}
            {kind === 'fund' && (
              <div className="mb-6 rounded-2xl border border-sage/20 bg-sage/5 p-5">
                <p className="text-xs text-ink-muted">
                  Agradecemos muito a todos que já contribuíram 💕
                </p>
              </div>
            )}

            {isOpenAmount && (
              <div className="mb-6 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
                <div>
                  <label
                    htmlFor="pix-amount"
                    className="mb-1.5 block text-sm font-medium text-ink"
                  >
                    Quanto você gostaria de contribuir?
                  </label>

                  <input
                    id="pix-amount"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min={minAmount ?? 0.01}
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder={minAmount ? minAmount.toFixed(2) : '150,00'}
                    className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-stone-300 focus:border-terracotta"
                  />

                  {minAmount != null && (
                    <p className="mt-1 text-xs text-ink-muted">
                      Valor mínimo: {brl(minAmount)}
                    </p>
                  )}
                </div>

                {suggestedAmounts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {suggestedAmounts.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleAmountChange(String(suggestion))}
                        className={`
                        rounded-full border px-4 py-1.5 text-sm transition
                        ${
                          amount === String(suggestion)
                            ? 'border-terracotta bg-terracotta/10 text-terracotta-dark'
                            : 'border-stone-200 text-ink-muted hover:border-terracotta/40'
                        }
                      `}
                      >
                        {brl(suggestion)}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={pending || !hasValidAmount}
                  className="w-full rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-white transition hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending
                    ? 'Gerando…'
                    : pix
                      ? 'Gerar novo QR Code'
                      : 'Gerar QR Code'}
                </button>

                {error && (
                  <p className="rounded border border-terracotta/30 bg-terracotta/5 p-3 text-sm text-terracotta-dark">
                    {error}
                  </p>
                )}
              </div>
            )}

            {pix ? (
              <PixQrCode qrImage={pix.qrImage} brCode={pix.brCode} />
            ) : (
              isOpenAmount && (
                <div className="rounded-2xl border border-dashed border-stone-200 p-10 text-center text-sm text-ink-muted">
                  Escolha um valor acima para gerar o QR Code 🤍
                </div>
              )
            )}
          </motion.div>

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

            {/* Gated on quotedAmount, not on `amount`: the form may only submit the
              exact figure the displayed QR was built from. */}
            {isOpenAmount && quotedAmount === null ? (
              <div className="rounded-3xl border border-dashed border-stone-200 bg-white/50 p-8 text-center text-sm text-ink-muted">
                Gere o QR Code com o valor escolhido para registrar seu carinho
                🤍
              </div>
            ) : (
              <ReserveGiftForm giftId={giftId} amount={quotedAmount} />
            )}
          </motion.div>
        </div>
      )}
    </section>
  )
}
