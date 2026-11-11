"use client"

import { useEffect, useRef, useState } from "react"
import { brand, checkoutNote, product } from "@/content/site"
import { formatMoney } from "@/lib/money"
import { useCart } from "@/components/cart-context"
import styles from "./cart-drawer.module.css"

export function CartDrawer() {
  const { line, isOpen, close, setQuantity, clear } = useCart()
  const closeButton = useRef<HTMLButtonElement>(null)
  const [asked, setAsked] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setAsked(false)
    closeButton.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    document.addEventListener("keydown", onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
    }
  }, [isOpen, close])

  const unit = line?.plan === "once" ? product.price : product.subscribePrice
  const total = line ? unit * line.quantity : 0
  const planLabel = line?.plan === "once" ? product.onceLabel : product.subscribeLabel

  return (
    <div className={styles.root} data-open={isOpen} hidden={!isOpen && !line ? true : undefined}>
      <button type="button" className={styles.backdrop} aria-label="Close cart" onClick={close} tabIndex={isOpen ? 0 : -1} />
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal={isOpen}
        aria-labelledby="cart-title"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <div className={styles.top}>
          <h2 id="cart-title">Your jar</h2>
          <button ref={closeButton} type="button" className={styles.close} onClick={close}>
            Close
          </button>
        </div>

        {line ? (
          <>
            <div className={styles.line}>
              <div>
                <p className={styles.name}>{brand.name}</p>
                <p className={styles.meta}>
                  {brand.product} · {planLabel}
                </p>
              </div>
              <p className={styles.unit}>{formatMoney(unit)}</p>
            </div>

            <div className={styles.quantity}>
              <button type="button" onClick={() => setQuantity(line.quantity - 1)} aria-label="Decrease quantity">
                −
              </button>
              <span aria-live="polite">{line.quantity}</span>
              <button type="button" onClick={() => setQuantity(line.quantity + 1)} aria-label="Increase quantity">
                +
              </button>
              <button type="button" className={styles.remove} onClick={clear}>
                Remove
              </button>
            </div>

            <div className={styles.footer}>
              <div className={styles.total}>
                <span>Subtotal</span>
                <span>{formatMoney(total)}</span>
              </div>
              <button type="button" className={styles.checkout} onClick={() => setAsked(true)}>
                Checkout
              </button>
              <p className={asked ? styles.noteAsked : styles.note}>{checkoutNote}</p>
            </div>
          </>
        ) : (
          <p className={styles.empty}>The jar is empty.</p>
        )}
      </aside>
    </div>
  )
}
