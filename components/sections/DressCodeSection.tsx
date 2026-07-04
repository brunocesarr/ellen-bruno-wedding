import { SectionWrapper } from '@/components/layout/SectionWrapper'
import { Reveal } from '@/components/ui/Reveal'

export function DressCodeSection() {
  return (
    <SectionWrapper id="dress-code" variant="ivory">
      <div className="text-center">
        <Reveal>
          <h2 className="mb-2 font-display text-section-title font-bold uppercase tracking-[0.2em] text-terracotta">
            Dress Code
          </h2>
        </Reveal>

        <p className="mb-3 font-body text-md uppercase tracking-widest text-warm-gray">
          Queridos convidados
        </p>

        <p className="mx-auto max-w-xl font-body text-sm leading-[1.8] text-warm-gray">
          Para que todos aproveitem a ocasião com conforto e elegância,
          sugerimos um traje esporte fino. Isso significa vestidos leves,
          macacões, calças de alfaiataria e camisas sociais - sem a necessidade
          de gravata ou ternos. Só pedimos para que evitem roupas nas cores
          branco, beje, off-white e terracota que será exclusivo dos padrinhos.
        </p>
        <p className="mx-auto max-w-xl font-body text-sm leading-[1.8] text-warm-gray">
          Queremos que vocês se sintam bem e aproveitem cada momento dessa
          celebração ao nosso lado.
        </p>

        <Reveal
          delay={0.15}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <div className="h-px w-8 bg-terracotta/20" />
          <span className="font-display text-xs tracking-wider text-terracotta/60">
            VIVAM O NOSSO MOMENTO
          </span>
          <div className="h-px w-8 bg-terracotta/20" />
        </Reveal>
      </div>
    </SectionWrapper>
  )
}
