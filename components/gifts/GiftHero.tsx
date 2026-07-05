'use client'

import { BrushStroke } from '@/components/ui/BrushStroke'
import { motion } from 'motion/react'
import { PolaroidPhoto } from './PolaroidPhoto'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
}

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.15 } },
}

type Props = {
  couplePhoto: string
  emotionPhoto: string
  foreverPhoto: string
}

export function GiftHero({ couplePhoto, emotionPhoto, foreverPhoto }: Props) {
  return (
    <section className="relative isolate overflow-hidden cream-grain">
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="absolute left-8 top-24 hidden md:block"
      >
        <BrushStroke color="terracotta" className="h-12 w-44" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="absolute right-12 top-12 hidden md:block"
      >
        <BrushStroke color="sage" className="h-10 w-36" />
      </motion.div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.p variants={fadeInUp} className="eyebrow">
            Lista de presentes
          </motion.p>
          <motion.h1 variants={fadeInUp} className="heading-display mt-4">
            Presentes <br className="hidden md:block" /> com afeto
          </motion.h1>
          <motion.p variants={fadeInUp} className="accent mt-5">
            <span className="mx-2 text-terracotta-light">—</span>
            Cada presente conta uma história
            <span className="mx-2 text-terracotta-light">—</span>
          </motion.p>
          <motion.p
            variants={fadeInUp}
            className="mt-8 max-w-md text-base leading-relaxed text-ink-muted"
          >
            Sua presença já é o nosso maior presente, mas se você desejar
            contribuir com algo que celebre o início da nossa nova vida juntos,
            preparamos esta lista com muito carinho. Pague de forma simples e
            segura via <strong className="text-ink">Pix</strong>.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-wrap gap-3"
          >
            <a href="#lista" className="btn-primary">
              Ver presentes
            </a>
            <a href="#como-funciona" className="btn-ghost">
              Como funciona
            </a>
          </motion.div>
        </motion.div>

        <div className="relative h-[420px] md:h-[520px]">
          <AnimatedPolaroid
            src={couplePhoto}
            alt="Ellen e Bruno"
            tilt="right"
            width={280}
            height={360}
            className="absolute left-1/2 top-6 z-20 md:w-[320px]"
            style={{ transform: 'translateX(-50%) rotate(3deg)' }}
            delay={0.4}
            initialRotate={20}
            finalRotate={3}
            priority
          />
          <AnimatedPolaroid
            src={emotionPhoto}
            alt="Ellen e Bruno"
            caption="emoção"
            tilt="left"
            width={170}
            height={200}
            className="absolute -left-2 top-32 z-30 md:left-0"
            delay={0.6}
            initialRotate={-25}
            finalRotate={-6}
          />
          <AnimatedPolaroid
            src={foreverPhoto}
            alt="Ellen e Bruno"
            caption="para sempre"
            tilt="right"
            width={170}
            height={200}
            className="absolute -right-2 bottom-2 z-30 md:right-4"
            delay={0.8}
            initialRotate={25}
            finalRotate={7}
          />
        </div>
      </div>
    </section>
  )
}

function AnimatedPolaroid({
  delay,
  initialRotate,
  finalRotate,
  ...props
}: React.ComponentProps<typeof PolaroidPhoto> & {
  delay: number
  initialRotate: number
  finalRotate: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: initialRotate, y: 60 }}
      animate={{ opacity: 1, scale: 1, rotate: finalRotate, y: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.2, 0.9, 0.3, 1] }}
      whileHover={{ scale: 1.05, rotate: finalRotate / 2, zIndex: 50 }}
      className={props.className}
      style={props.style}
    >
      <PolaroidPhoto {...props} className="" style={undefined} />
    </motion.div>
  )
}
