"use client"

import { brand, product } from "@/content/site"
import { formatMoney } from "@/lib/money"
import { useCart } from "@/components/cart-context"
import { useChrome } from "@/components/chrome-context"
import styles from "./header.module.css"

const links = [
  { href: "#statement", label: "Powder" },
  { href: "#formula", label: "Formula" },
  { href: "#feeding", label: "Feeding" },
]

export function Header() {
  const { surface } = useChrome()
  const { count, open, add } = useCart()

  return (
    <header className={styles.header} data-surface={surface}>
      <a className={styles.skip} href="#statement">
        Skip to the product
      </a>
      <a className={styles.wordmark} href="#story">
        {brand.name}
      </a>
      <nav className={styles.nav} aria-label="Page">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className={styles.actions}>
        <p className={styles.price}>From {formatMoney(product.subscribePrice)}</p>
        {count > 0 ? (
          <button type="button" className={styles.bag} onClick={open} aria-label={`Cart, ${count} in the jar`}>
            {count}
          </button>
        ) : null}
        <button type="button" className={styles.cart} onClick={() => add("subscribe", 1)}>
          Add to cart
        </button>
      </div>
    </header>
  )
}
