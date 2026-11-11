"use client"

import type { ReactNode } from "react"
import { CartProvider } from "@/components/cart-context"
import { ChromeProvider } from "@/components/chrome-context"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ChromeProvider>
      <CartProvider>{children}</CartProvider>
    </ChromeProvider>
  )
}
