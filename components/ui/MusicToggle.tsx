'use client'

import { Music, Volume2, VolumeX } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'wedding:music-on'
const TARGET_VOLUME = 0.35
const FADE_MS = 800

export function MusicToggle({
  src = '/audio/background-song.mp3',
}: {
  src?: string
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const reduce = useReducedMotion()

  // Restore preference on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === '1') setHasInteracted(true) // user opted in previously, but still wait for click
  }, [])

  const fadeTo = useCallback((target: number, onDone?: () => void) => {
    const audio = audioRef.current
    if (!audio) return
    if (fadeTimer.current) clearInterval(fadeTimer.current)
    const steps = 20
    const stepMs = FADE_MS / steps
    const delta = (target - audio.volume) / steps
    let i = 0
    fadeTimer.current = setInterval(() => {
      if (!audioRef.current) return
      i += 1
      audioRef.current.volume = Math.max(
        0,
        Math.min(1, audioRef.current.volume + delta)
      )
      if (i >= steps) {
        if (fadeTimer.current) clearInterval(fadeTimer.current)
        audioRef.current.volume = target
        onDone?.()
      }
    }, stepMs)
  }, [])

  const toggle = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    setHasInteracted(true)

    if (audio.paused) {
      audio.volume = 0
      try {
        await audio.play()
        fadeTo(TARGET_VOLUME)
        setIsPlaying(true)
        localStorage.setItem(STORAGE_KEY, '1')
      } catch {
        setIsPlaying(false)
      }
    } else {
      fadeTo(0, () => {
        audio.pause()
        setIsPlaying(false)
        localStorage.setItem(STORAGE_KEY, '0')
      })
    }
  }, [fadeTo])

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />
      <motion.button
        type="button"
        onClick={toggle}
        aria-label={
          isPlaying ? 'Pausar música do casal' : 'Tocar música do casal'
        }
        aria-pressed={isPlaying}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-6 left-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/30 text-stone-700 shadow-lg backdrop-blur-md transition-colors hover:bg-white/50"
      >
        <motion.span
          animate={isPlaying && !reduce ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="flex"
        >
          {!hasInteracted ? (
            <Music className="h-5 w-5" />
          ) : isPlaying ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </motion.span>
      </motion.button>
    </>
  )
}
