/**
 * The scroll film: three JPEG sequences played as one continuous story.
 * Frame files live in /assets and are served from /frames (see public/frames).
 * `at` is a 0–1 position through the whole film, chosen to match the pictures.
 *
 * The running sequence is a different dog on a bright set, already mid-stride.
 * Its join dips through white so the two animals are never on screen together.
 */

export type Tone = "light" | "dark"
export type Join = "blend" | "dip"

export type SequenceSource = {
  id: string
  folder: string
  count: number
  tone: Tone
  /** How this sequence hands off to the next. The last sequence has none. */
  join?: Join
}

export const sequences: SequenceSource[] = [
  { id: "intro", folder: "intro-upscaled", count: 196, tone: "light", join: "blend" },
  { id: "xray", folder: "xray-upscaled", count: 224, tone: "dark", join: "dip" },
  { id: "running", folder: "running-upscaled", count: 224, tone: "light" },
]

/** How far the page scrolls for each frame. Higher is a slower, longer film. */
export const pixelsPerFrame = 14

export const frameCount = sequences.reduce((total, sequence) => total + sequence.count, 0)

export const beats = [
  {
    id: "jar",
    at: 0,
    kicker: "The jar",
    line: "Collagen, and nothing else beside it.",
  },
  {
    id: "open",
    at: 0.117,
    kicker: "Open",
    line: "Open the jar. There is only collagen inside.",
  },
  {
    id: "pour",
    at: 0.222,
    kicker: "Pour",
    line: "A fine powder for the food they already eat.",
  },
  {
    id: "joint",
    at: 0.313,
    kicker: "The joint",
    line: "Down where collagen already belongs.",
  },
  {
    id: "body",
    at: 0.43,
    kicker: "In the body",
    line: "Small peptides, for dogs who react to the usual proteins.",
  },
  {
    id: "dog",
    at: 0.548,
    kicker: "The whole dog",
    line: "Then back to the animal you actually live with.",
  },
  {
    id: "run",
    at: 0.7,
    kicker: "The run",
    line: "Out of the scan, and into a stride.",
  },
  {
    id: "rest",
    at: 0.83,
    kicker: "At rest",
    line: "Home, next to the jar.",
  },
] as const

export type Beat = (typeof beats)[number]

export function beatFor(progress: number): Beat {
  let current: Beat = beats[0]
  for (const beat of beats) {
    if (progress >= beat.at) current = beat
  }
  return current
}

export function frameUrl(folder: string, frameNumber: number) {
  const file = String(frameNumber).padStart(3, "0")
  return `/frames/${folder}/ezgif-frame-${file}.jpg`
}
