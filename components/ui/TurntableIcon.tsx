'use client'

import { cn } from '@/src/lib/utils'
import { motion } from 'motion/react'

type Props = {
  playing: boolean
  /** Comes from useReducedMotion() in the parent, which owns the audio state. */
  reduce?: boolean | null
}

/**
 * A record player small enough to live in a 48px floating control: the platter
 * fills the button, and the tonearm sweeps in from the rim to sit on a groove.
 *
 * The spin is a CSS animation (`vinyl-platter` / `vinyl-spinning`) rather than
 * a motion value so that pausing FREEZES it in place — animating `rotate` back
 * to 0 would wind the record backwards on every pause. It also inherits the
 * global prefers-reduced-motion kill switch in globals.css for free.
 */
export function TurntableIcon({ playing, reduce = false }: Props) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="h-full w-full">
      <defs>
        <radialGradient id="turntable-vinyl" cx="36%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#44403c" />
          <stop offset="55%" stopColor="#1c1917" />
          <stop offset="100%" stopColor="#0c0a09" />
        </radialGradient>
      </defs>

      {/* The record IS the button: r=22.5 of a 24 half-box leaves just enough
          rim for the glass ring behind it to read as the platter edge. */}
      <g
        className={cn('vinyl-platter', playing && !reduce && 'vinyl-spinning')}
      >
        <circle cx="24" cy="24" r="22.5" fill="url(#turntable-vinyl)" />

        {[19, 16.2, 13.4, 10.6].map((r) => (
          <circle
            key={r}
            cx="24"
            cy="24"
            r={r}
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.09"
            strokeWidth="0.6"
          />
        ))}

        {/* The reflection is what makes the rotation readable — concentric
            grooves alone look identical at every angle. */}
        <path
          d="M24 4 A20 20 0 0 1 38.1 9.9"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.15"
          strokeWidth="3"
          strokeLinecap="round"
        />

        <circle cx="24" cy="24" r="7" fill="#b45309" />
        <circle
          cx="24"
          cy="24"
          r="5"
          fill="none"
          stroke="#fde68a"
          strokeOpacity="0.5"
          strokeWidth="0.6"
        />
        <circle cx="24" cy="24" r="1.3" fill="#fef3c7" />
      </g>

      {/* Tonearm: pivots on the rim at the top right and drops onto a groove;
          pausing swings it back off the record. */}
      <motion.g
        initial={false}
        animate={{ rotate: playing ? 0 : -24 }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: 'spring', stiffness: 160, damping: 18 }
        }
        style={{ transformBox: 'view-box', transformOrigin: '41px 8px' }}
      >
        <line
          x1="40.4"
          y1="9.6"
          x2="34.5"
          y2="33.5"
          stroke="#e7e5e4"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="34.5" cy="33.5" r="2.2" fill="#f5f5f4" />
        <line
          x1="34.2"
          y1="35.3"
          x2="34"
          y2="36.6"
          stroke="#a8a29e"
          strokeWidth="0.9"
          strokeLinecap="round"
        />
        <circle cx="41" cy="8" r="3.6" fill="#a8a29e" />
        <circle cx="41" cy="8" r="1.5" fill="#e7e5e4" />
      </motion.g>
    </svg>
  )
}
