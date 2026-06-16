import { Reveal, RevealItem, RevealStagger } from '@/components/ui/Reveal'
import { Gift, Heart, QrCode, ShieldCheck } from 'lucide-react'

const STEPS = [
  {
    icon: Gift,
    title: 'Escolha um presente',
    description: 'Veja a lista e selecione o que mais combina com você.',
  },
  {
    icon: QrCode,
    title: 'Pague pelo Pix',
    description: 'Use o QR Code ou copie o código. Simples, rápido e seguro.',
  },
  {
    icon: ShieldCheck,
    title: 'Confira o destinatário',
    description:
      'Ao abrir o app do banco, confirme que os dados do Pix mostram "Bruno César" ou "Ellen Lopes" como recebedor antes de finalizar.',
  },
  {
    icon: Heart,
    title: 'Receba nosso carinho',
    description:
      'Cada contribuição é uma lembrança especial da nossa história.',
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" className="mx-auto max-w-7xl px-6 py-20">
      <Reveal className="mb-12 text-center">
        <p className="eyebrow">Como funciona</p>
        <h2 className="heading-display mt-4">Três passos simples</h2>
      </Reveal>

      <RevealStagger className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {STEPS.map((step, i) => (
          <RevealItem key={step.title} className="relative text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-cream-dark">
              <step.icon className="size-7 text-terracotta" aria-hidden />
            </div>
            <span className="mt-4 inline-block font-display text-3xl text-terracotta-light">
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className="mt-2 font-display text-xl text-ink">{step.title}</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink-muted">
              {step.description}
            </p>
          </RevealItem>
        ))}
      </RevealStagger>
    </section>
  )
}
