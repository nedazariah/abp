import { facts, feeding, formula, previewNote, statement } from "@/content/site"
import { frameUrl } from "@/content/film"
import { Purchase } from "@/components/purchase"
import styles from "./product-sections.module.css"

export function ProductSections() {
  return (
    <div className={styles.page}>
      <section id="statement" className={styles.wrap}>
        <div className={styles.statement}>
          <div>
            <p className={styles.eyebrow}>{statement.eyebrow}</p>
            <h1>{statement.title}</h1>
          </div>
          <div className={styles.copy}>
            {statement.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <figure className={styles.still}>
        <img src={frameUrl("intro", 168)} alt="Collagen powder pouring from the open bottle." />
        <figcaption>Open. Pour. Stir.</figcaption>
      </figure>

      <section className={styles.wrap} aria-label="What the powder is">
        <ol className={styles.facts}>
          {facts.map((fact, index) => (
            <li key={fact.title}>
              <span>0{index + 1}</span>
              <h2>{fact.title}</h2>
              <p>{fact.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="formula" className={styles.wrap}>
        <div className={styles.formula}>
          <div>
            <p className={styles.eyebrow}>Formula</p>
            <h2>Bovine collagen, hydrolyzed.</h2>
          </div>
          <dl>
            {formula.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="feeding" className={styles.wrap}>
        <div className={styles.feeding}>
          <div>
            <p className={styles.eyebrow}>In the bowl</p>
            <h2>The scoop follows the dog.</h2>
            <p>Stir it into the food they already finish. Amounts below are a preview.</p>
          </div>
          <table>
            <thead>
              <tr>
                <th scope="col">Weight</th>
                <th scope="col">Daily</th>
              </tr>
            </thead>
            <tbody>
              {feeding.map((row) => (
                <tr key={row.weight}>
                  <td>{row.weight}</td>
                  <td>{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Purchase />

      <footer className={`${styles.wrap} ${styles.footer}`}>
        <p>A Boundless Pack</p>
        <p>{previewNote}</p>
      </footer>
    </div>
  )
}
