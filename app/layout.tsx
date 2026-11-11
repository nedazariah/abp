import type { ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import { Instrument_Sans, Instrument_Serif } from "next/font/google"
import { CartDrawer } from "@/components/cart-drawer"
import { Header } from "@/components/header"
import { Providers } from "@/components/providers"
import "./globals.css"

const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
})

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "A Boundless Pack",
  description: "Hydrolyzed bovine collagen powder for dogs.",
}

export const viewport: Viewport = {
  themeColor: "#f3f0ea",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <Providers>
          <Header />
          {children}
          <CartDrawer />
        </Providers>
      </body>
    </html>
  )
}
