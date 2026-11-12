import { beats, frameUrl } from "@/content/film"
import styles from "./still-story.module.css"

const stills = [
  {
    src: frameUrl("intro-upscaled", 168),
    alt: "A green bottle pouring a stream of white collagen powder.",
    beat: beats[2],
    tone: "light" as const,
  },
  {
    src: frameUrl("xray-upscaled", 224),
    alt: "A small fluffy dog standing, its skeleton visible like an x-ray.",
    beat: beats[5],
    tone: "dark" as const,
  },
  {
    src: frameUrl("running-upscaled", 200),
    alt: "A pomeranian sitting beside a green bottle of collagen powder.",
    beat: beats[7],
    tone: "light" as const,
  },
]

/** The same story, as stills, when scroll-scrubbing is turned off. */
export function StillStory() {
  return (
    <div id="story">
      {stills.map((still, index) => (
        <figure key={still.src} className={styles.still} data-tone={still.tone}>
          <img src={still.src} alt={still.alt} />
          <figcaption>
            <p className={styles.kicker}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {still.beat.kicker}
            </p>
            <p className={styles.line}>{still.beat.line}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
