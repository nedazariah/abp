"use client"

import { useEffect, useRef, useState } from "react"
import { useChrome } from "@/components/chrome-context"
import { beatFor, beats, frameCount, frameUrl, pixelsPerFrame, sequences, type Beat } from "@/content/film"
import { FrameReel, type ReelSequence } from "@/lib/frame-reel"
import styles from "./scroll-film.module.css"

const reelSequences: ReelSequence[] = sequences.map((sequence) => ({
  id: sequence.id,
  count: sequence.count,
  tone: sequence.tone,
  join: sequence.join,
  url: (frameNumber: number) => frameUrl(sequence.folder, frameNumber),
}))

const scrollHeight = `calc(100dvh + ${(frameCount - 1) * pixelsPerFrame}px)`
/** Frames decoded before the film is revealed. Enough to start a scroll. */
const OPENING_FRAMES = 32

/**
 * Pins the film to the viewport and scrubs the JPEG sequences with the scrollbar.
 * Reduced motion skips the ease and jumps straight to the frame under the scrollbar.
 */
export function ScrollFilm() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const cueRef = useRef<HTMLParagraphElement>(null)
  const [beat, setBeat] = useState<Beat>(beats[0])
  const [tone, setTone] = useState<"light" | "dark">("light")
  const [reduced, setReduced] = useState(false)
  const [ready, setReady] = useState(false)
  const [warm, setWarm] = useState({ loaded: 0, total: OPENING_FRAMES })
  const { setSurface } = useChrome()

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduced(media.matches)
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [])

  useEffect(() => {
    setSurface("light")
  }, [setSurface])

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return

    setReady(false)
    const session = {
      reel: null as FrameReel | null,
      stop: null as (() => void) | null,
    }
    let beatId: string = beats[0].id
    let currentTone: "light" | "dark" = "light"
    let docked = false
    let cancel = false

    const redraw = () => session.reel?.resize()
    const observer = new ResizeObserver(() => redraw())
    observer.observe(canvas)

    const setup = () => {
      const reel = new FrameReel(canvas, reelSequences)
      session.reel = reel
      reel.resize()
      void reel.warmup(OPENING_FRAMES, (loaded, total) => {
        if (!cancel) setWarm({ loaded, total })
      }).then(() => {
        if (!cancel) setReady(true)
      })
      reel.seek(0)

      const playhead = { progress: 0 }
      let cueHidden = false

      const render = () => {
        const state = reel.seek(playhead.progress)
        if (state.tone !== currentTone) {
          currentTone = state.tone
          setTone(state.tone)
          if (!docked) setSurface(state.tone)
        }
        const nextBeat = beatFor(playhead.progress)
        if (nextBeat.id !== beatId) {
          beatId = nextBeat.id
          setBeat(nextBeat)
        }
      }

      // Read the scrollbar directly and ease toward it. The pictures then
      // follow the scroll instead of jumping to the frame a fast flick lands on.
      const tick = () => {
        const max = Math.max(1, section.offsetHeight - window.innerHeight)
        const offset = window.scrollY - section.offsetTop
        const target = clamp(offset / max, 0, 1)
        if (reduced) {
          playhead.progress = target
        } else {
          playhead.progress += (target - playhead.progress) * 0.16
          if (Math.abs(target - playhead.progress) < 0.0005) playhead.progress = target
        }

        if (barRef.current) barRef.current.style.transform = `scaleX(${playhead.progress})`
        const hideCue = playhead.progress > 0.02
        if (cueRef.current && hideCue !== cueHidden) {
          cueHidden = hideCue
          cueRef.current.dataset.hidden = hideCue ? "true" : "false"
        }

        const past = offset > max + 32
        if (past !== docked) {
          docked = past
          setSurface(past ? "paper" : currentTone)
        }
        render()
      }

      const timer = window.setInterval(tick, 16)
      session.stop = () => window.clearInterval(timer)
      tick()
      window.addEventListener("resize", redraw)
    }

    setup()

    return () => {
      cancel = true
      observer.disconnect()
      window.removeEventListener("resize", redraw)
      session.stop?.()
      session.reel?.destroy()
    }
  }, [reduced, setSurface])

  useEffect(() => {
    if (ready) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [ready])

  const beatIndex = Math.max(0, beats.findIndex((item) => item.id === beat.id))
  const warmScale = warm.total > 0 ? warm.loaded / warm.total : 0

  return (
    <section ref={sectionRef} id="story" className={styles.film} style={{ height: scrollHeight }}>
      {ready ? null : (
        <div className={styles.opening} role="status" aria-live="polite" aria-label="Loading the film">
          <p className={styles.openingMark}>A Boundless Pack</p>
          <span className={styles.openingTrack} aria-hidden="true">
            <span className={styles.openingBar} style={{ transform: `scaleX(${warmScale})` }} />
          </span>
        </div>
      )}
      <div className={styles.stage} data-tone={tone}>
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div className={styles.veil} aria-hidden="true" />
        <div className={styles.caption} data-place={beat.place} aria-live="polite">
          <p className={styles.kicker}>
            <span className={styles.index}>{String(beatIndex + 1).padStart(2, "0")}</span>
            {beat.kicker}
          </p>
          <p key={beat.id} className={styles.line}>
            {beat.line}
          </p>
        </div>
        <p ref={cueRef} className={styles.cue}>
          Scroll
        </p>
        <button
          type="button"
          className={styles.skip}
          onClick={() => document.getElementById("statement")?.scrollIntoView({ behavior: "smooth" })}
        >
          Skip
        </button>
        <span className={styles.progress} aria-hidden="true">
          <span ref={barRef} className={styles.progressBar} />
        </span>
      </div>
    </section>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
