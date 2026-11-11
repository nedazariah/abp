"use client"

import { useState } from "react"
import { brand, checkoutNote, product, type Plan } from "@/content/site"
import { formatMoney } from "@/lib/money"
import { useCart } from "@/components/cart-context"
import styles from "./purchase.module.css"

const plans: { id: Plan; label: string; detail: string }[] = [
  { id: "subscribe", label: product.subscribeLabel, detail: "A jar, on its own" },
  { id: "once", label: product.onceLabel, detail: "A single jar" },
]

export function Purchase() {
  const { add } = useCart()
  const [plan, setPlan] = useState<Plan>("subscribe")
  const [quantity, setQuantity] = useState(1)
  const price = plan === "subscribe" ? product.subscribePrice : product.price

  return (
    <section id="purchase" className={styles.band}>
      <div className={styles.layout}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>The jar</p>
          <h2>One collagen. Every day.</h2>
          <p>Choose a jar, or a jar that comes back on its own.</p>
        </div>

        <form
          className={styles.card}
          onSubmit={(event) => {
            event.preventDefault()
            add(plan, quantity)
          }}
        >
          <div className={styles.cardTop}>
            <div>
              <p className={styles.name}>{brand.name}</p>
              <p className={styles.product}>{brand.product}</p>
            </div>
            <p className={styles.price}>
              {formatMoney(price)}
              {plan === "subscribe" ? <span> / month</span> : null}
            </p>
          </div>

          <div className={styles.plans} role="radiogroup" aria-label="How often">
            {plans.map((option) => (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={plan === option.id}
                className={styles.plan}
                onClick={() => setPlan(option.id)}
              >
                <span>{option.label}</span>
                <span>{option.detail}</span>
              </button>
            ))}
          </div>

          <div className={styles.row}>
            <div className={styles.quantity}>
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
                −
              </button>
              <span aria-live="polite">{quantity}</span>
              <button type="button" onClick={() => setQuantity((value) => Math.min(9, value + 1))} aria-label="Increase quantity">
                +
              </button>
            </div>
            <button type="submit" className={styles.add}>
              Add to cart
            </button>
          </div>
          <p className={styles.note}>{checkoutNote}</p>
        </form>
      </div>
    </section>
  )
}
