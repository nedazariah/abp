/**
 * Customer-facing copy and the single product.
 * Preview language and pricing, until the final brand copy is written.
 * Checkout is not connected to Shopify yet.
 */

export type Plan = "once" | "subscribe"

export const brand = {
  name: "A Boundless Pack",
  product: "Collagen powder",
  audience: "For dogs",
}

/** Prices are integer cents so a future Shopify product can use the same shape. */
export const product = {
  price: 4800,
  subscribePrice: 4320,
  subscribeLabel: "Every month",
  onceLabel: "One time",
}

export const statement = {
  eyebrow: "Collagen powder",
  title: "For dogs who react to the usual bowl.",
  paragraphs: [
    "Hydrolyzed from bovine skin and bone. One protein, stirred into the food they already eat.",
    "Most joint powders arrive as a recipe. This jar is collagen, broken down small, for dogs who do better without a blend of flavors on top.",
  ],
}

export const facts = [
  {
    title: "Hydrolyzed",
    body: "Peptides small enough to disappear into a meal.",
  },
  {
    title: "Bovine",
    body: "Skin and bone, from cattle. A single animal source.",
  },
  {
    title: "Daily",
    body: "One scoop, in the bowl, on the days you feed them.",
  },
]

export const formula = [
  { label: "Source", value: "Bovine skin and bone" },
  { label: "Process", value: "Hydrolyzed to peptides" },
  { label: "In the bowl", value: "Stir into food" },
  { label: "Left out", value: "Poultry, fish, and flavor fillers" },
]

export const feeding = [
  { weight: "Under 25 lb", amount: "½ scoop" },
  { weight: "25–50 lb", amount: "1 scoop" },
  { weight: "Over 50 lb", amount: "2 scoops" },
]

export const previewNote =
  "Preview storefront. Copy, price, and feeding amounts are placeholders. Checkout will open in Shopify."

export const checkoutNote = "Checkout will open in Shopify. Not connected in this preview."
