"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

export type Surface = "light" | "dark" | "paper"

type ChromeValue = {
  surface: Surface
  setSurface: (surface: Surface) => void
}

const ChromeContext = createContext<ChromeValue | null>(null)

export function ChromeProvider({ children }: { children: ReactNode }) {
  const [surface, setSurface] = useState<Surface>("light")
  const value = useMemo(() => ({ surface, setSurface }), [surface])
  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>
}

export function useChrome() {
  const value = useContext(ChromeContext)
  if (!value) throw new Error("useChrome must be used within ChromeProvider")
  return value
}
