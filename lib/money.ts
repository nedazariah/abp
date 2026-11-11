const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

/** Formats integer cents. $48.00 renders as $48, $43.20 stays $43.20. */
export function formatMoney(cents: number) {
  return money.format(cents / 100).replace(/\.00$/, "")
}
