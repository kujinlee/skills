import type { Cart, MoneyCents } from "./types.js";

/** Sum of (qty * unit - item discount) per line; item discount is per unit in this toy model. */
export function calculateSubtotal(cart: Cart): MoneyCents {
  let sum = 0;
  for (const item of cart.items) {
    const line = item.quantity * item.unitPriceCents;
    const perLineMarkdown = (item.itemDiscountCents ?? 0) * item.quantity;
    sum += line - perLineMarkdown;
  }
  return sum;
}
