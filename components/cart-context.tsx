"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { Plan } from "@/content/site"

const MAX_QUANTITY = 9

export type CartLine = {
  plan: Plan
  quantity: number
}

type CartValue = {
  line: CartLine | null
  isOpen: boolean
  count: number
  add: (plan: Plan, quantity: number) => void
  setQuantity: (quantity: number) => void
  clear: () => void
  open: () => void
  close: () => void
}

const CartContext = createContext<CartValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [line, setLine] = useState<CartLine | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const value = useMemo<CartValue>(
    () => ({
      line,
      isOpen,
      count: line?.quantity ?? 0,
      add: (plan, quantity) => {
        setLine((current) => {
          if (!current || current.plan !== plan) return { plan, quantity }
          return { plan, quantity: Math.min(MAX_QUANTITY, current.quantity + quantity) }
        })
        setIsOpen(true)
      },
      setQuantity: (quantity) => {
        setLine((current) => {
          if (!current) return current
          return { ...current, quantity: Math.min(MAX_QUANTITY, Math.max(1, quantity)) }
        })
      },
      clear: () => {
        setLine(null)
        setIsOpen(false)
      },
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }),
    [line, isOpen],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error("useCart must be used within CartProvider")
  return value
}
