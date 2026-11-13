/**
 * Draws a list of JPEG sequences onto one canvas.
 *
 * Scroll progress, from 0 to 1, maps onto a single frame index across every
 * sequence in order. A window of frames around the playhead is kept loaded
 * so the film can be scrubbed without decoding the whole sequence at once.
 */

export type ReelSequence = {
  id: string
  count: number
  tone: "light" | "dark"
  /** How this sequence hands off to the next. The last sequence has none. */
  join?: "blend" | "dip"
  /** 1-based frame number, matching the file names. */
  url: (frameNumber: number) => string
}

export type Playhead = {
  index: number
  sequenceId: string
  tone: "light" | "dark"
  progress: number
}

const BEHIND = 16
const AHEAD = 40
const CONCURRENCY = 6
/** Frames blended on either side of a cut between sequences. */
const FADE = 8
/** Frames of white on either side of a cut between mismatched shots. */
const DIP = 14
const DIP_COLOR = "#f3f4f5"

type Slot = {
  image: HTMLImageElement
  status: "loading" | "ready" | "failed"
}

export class FrameReel {
  private ctx: CanvasRenderingContext2D
  private total: number
  private slots = new Map<number, Slot>()
  private queue: number[] = []
  private active = 0
  private desired = 0
  private painted = -1
  /** False when `painted` is showing a nearby frame while the real one loads. */
  private paintedExact = false
  /** Index of the JPEG actually on the canvas. */
  private shown = -1
  private destroyed = false

  constructor(
    private canvas: HTMLCanvasElement,
    private sequences: ReelSequence[],
  ) {
    const context = canvas.getContext("2d", { alpha: false })
    if (!context) throw new Error("Canvas 2D is not available")
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = "high"
    this.ctx = context
    this.total = sequences.reduce((sum, sequence) => sum + sequence.count, 0)
    if (this.total < 1) throw new Error("The film has no frames")
  }

  get length() {
    return this.total
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const rect = this.canvas.getBoundingClientRect()
    const width = Math.max(1, Math.round(rect.width * dpr))
    const height = Math.max(1, Math.round(rect.height * dpr))
    if (this.canvas.width === width && this.canvas.height === height) return
    this.canvas.width = width
    this.canvas.height = height
    this.painted = -1
    this.paintedExact = false
    this.shown = -1
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = "high"
    this.paint(this.desired)
  }

  /** Moves the playhead. `progress` is clamped to 0–1. */
  seek(progress: number): Playhead {
    const clamped = clamp(progress, 0, 1)
    const index = Math.round(clamped * (this.total - 1))
    this.desired = index
    this.paint(index)
    this.retain(index)
    const sequence = this.sequenceAt(index)
    return { index, sequenceId: sequence.id, tone: sequence.tone, progress: clamped }
  }

  /**
   * Loads the opening frames before the film is shown. Resolves when they
   * have settled, or after a short cap so a slow connection still gets in.
   * Polled with a timer because some embedded browsers never fire animation frames.
   */
  warmup(count: number, onProgress?: (loaded: number, total: number) => void) {
    const target = Math.min(count, this.total)
    for (let index = 0; index < target; index += 1) this.request(index)
    onProgress?.(0, target)
    return new Promise<void>((resolve) => {
      const started = performance.now()
      const timer = window.setInterval(() => {
        if (this.destroyed) {
          window.clearInterval(timer)
          resolve()
          return
        }
        const loaded = this.rangeSettledCount(0, target)
        onProgress?.(loaded, target)
        const timedOut = performance.now() - started > 4000
        if (loaded < target && !timedOut) return
        window.clearInterval(timer)
        this.painted = -1
        this.paintedExact = false
        this.shown = -1
        this.paint(this.desired)
        resolve()
      }, 32)
    })
  }

  destroy() {
    this.destroyed = true
    this.queue = []
    for (const slot of this.slots.values()) {
      slot.image.onload = null
      slot.image.onerror = null
      slot.image.src = ""
    }
    this.slots.clear()
  }

  private rangeSettledCount(start: number, end: number) {
    let count = 0
    for (let index = start; index < end; index += 1) {
      const status = this.slots.get(index)?.status
      if (status === "ready" || status === "failed") count += 1
    }
    return count
  }

  private sequenceAt(index: number) {
    let cursor = index
    for (const sequence of this.sequences) {
      if (cursor < sequence.count) return sequence
      cursor -= sequence.count
    }
    return this.sequences[this.sequences.length - 1]
  }

  private urlAt(index: number) {
    let cursor = index
    for (const sequence of this.sequences) {
      if (cursor < sequence.count) return sequence.url(cursor + 1)
      cursor -= sequence.count
    }
    const last = this.sequences[this.sequences.length - 1]
    return last.url(last.count)
  }

  private retain(index: number) {
    const from = Math.max(0, index - BEHIND)
    const to = Math.min(this.total - 1, index + AHEAD)
    for (const [frame, slot] of this.slots) {
      if (frame >= from - 8 && frame <= to + 8) continue
      if (slot.status === "loading") this.active = Math.max(0, this.active - 1)
      slot.image.onload = null
      slot.image.onerror = null
      slot.image.src = ""
      this.slots.delete(frame)
    }
    this.queue = this.queue.filter((frame) => frame >= from && frame <= to)
    for (let frame = index; frame <= to; frame += 1) this.request(frame)
    for (let frame = index - 1; frame >= from; frame -= 1) this.request(frame)
  }

  private request(index: number) {
    if (this.slots.has(index) || this.queue.includes(index)) return
    this.queue.push(index)
    this.pump()
  }

  private pump() {
    while (this.active < CONCURRENCY && this.queue.length > 0) {
      const index = this.queue.shift()
      if (index === undefined || this.slots.has(index)) continue
      const image = new Image()
      image.decoding = "async"
      if (index < 32) image.fetchPriority = "high"
      const slot: Slot = { image, status: "loading" }
      this.slots.set(index, slot)
      this.active += 1
      image.onload = () => {
        this.active -= 1
        if (this.destroyed) return
        if (this.slots.get(index) === slot) {
          slot.status = "ready"
          if (Math.abs(index - this.desired) <= DIP) this.paint(this.desired)
        }
        this.pump()
      }
      image.onerror = () => {
        this.active -= 1
        if (this.slots.get(index) === slot) slot.status = "failed"
        this.pump()
      }
      image.src = this.urlAt(index)
    }
  }

  private readyImage(index: number) {
    const slot = this.slots.get(index)
    if (!slot || slot.status !== "ready" || slot.image.naturalWidth === 0) return null
    return slot.image
  }

  private paint(index: number) {
    if (this.canvas.width === 0 || this.canvas.height === 0) return
    if (index === this.painted && this.paintedExact) return
    const join = this.joinAt(index)
    if (join?.mode === "dip") {
      const dipped = this.paintDip(index, join)
      if (dipped) {
        this.painted = index
        this.paintedExact = true
        this.shown = index
        return
      }
    } else if (join) {
      const from = this.readyImage(join.boundary - 1)
      const to = this.readyImage(join.boundary)
      if (from || to) {
        this.cover(from, 1)
        if (to) this.cover(to, join.blend)
        this.painted = index
        this.paintedExact = Boolean(from && to)
        this.shown = index
        return
      }
    } else {
      const image = this.readyImage(index)
      if (image) {
        this.cover(image, 1)
        this.painted = index
        this.paintedExact = true
        this.shown = index
        return
      }
    }

    const nearby = this.nearestReady(index)
    if (!nearby) return
    if (this.painted === index && this.shown === nearby.index) return
    this.cover(nearby.image, 1)
    this.painted = index
    this.paintedExact = false
    this.shown = nearby.index
  }

  /** The closest decoded frame, preferring one already passed. */
  private nearestReady(index: number) {
    const limit = BEHIND + AHEAD
    for (let delta = 1; delta <= limit; delta += 1) {
      const before = index - delta
      if (before >= 0) {
        const image = this.readyImage(before)
        if (image) return { index: before, image }
      }
      const after = index + delta
      if (after < this.total) {
        const image = this.readyImage(after)
        if (image) return { index: after, image }
      }
    }
    return null
  }

  /** A blend factor when `index` sits on the cut between two sequences. */
  private joinAt(index: number) {
    let boundary = 0
    for (let i = 0; i < this.sequences.length - 1; i += 1) {
      const sequence = this.sequences[i]
      boundary += sequence.count
      const mode = sequence.join ?? "blend"
      const span = mode === "dip" ? DIP : FADE
      const start = boundary - span
      const end = boundary + span
      if (index >= start && index < end) {
        return { boundary, mode, span, blend: (index - start) / (span * 2) }
      }
    }
    return null
  }

  /**
   * Holds the last frame, fades it to white, then brings the next shot up.
   * The two pictures never share the screen, so a different dog can take over.
   */
  private paintDip(
    index: number,
    join: { boundary: number; span: number },
  ) {
    const incoming = index >= join.boundary
    const image = this.readyImage(incoming ? index : join.boundary - 1)
    if (!image) return false
    this.cover(image, 1)
    const veil = incoming
      ? (join.boundary + join.span - index) / join.span
      : (index - (join.boundary - join.span)) / join.span
    this.ctx.fillStyle = DIP_COLOR
    this.ctx.globalAlpha = clamp(veil, 0, 1)
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.globalAlpha = 1
    return true
  }

  private cover(image: HTMLImageElement | null, alpha: number) {
    if (!image) return
    const width = this.canvas.width
    const height = this.canvas.height
    // A tall screen crops a 16:9 frame down to a center slice. Fit the whole
    // picture instead, and let the stage show in the bands above and below.
    const fit = height > width
    const scale = fit
      ? Math.min(width / image.naturalWidth, height / image.naturalHeight)
      : Math.max(width / image.naturalWidth, height / image.naturalHeight)
    const drawWidth = image.naturalWidth * scale
    const drawHeight = image.naturalHeight * scale
    const x = (width - drawWidth) / 2
    const y = (height - drawHeight) / 2
    if (alpha >= 1) {
      this.ctx.globalAlpha = 1
      if (fit) {
        this.ctx.fillStyle = this.sequenceAt(this.desired).tone === "dark" ? "#101416" : "#d5d6d2"
        this.ctx.fillRect(0, 0, width, height)
      }
      this.ctx.drawImage(image, x, y, drawWidth, drawHeight)
      return
    }
    this.ctx.globalAlpha = alpha
    this.ctx.drawImage(image, x, y, drawWidth, drawHeight)
    this.ctx.globalAlpha = 1
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
