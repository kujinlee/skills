import type { Coupon, MoneyCents } from "./types.js";

export function applyDiscount(subtotalCents: MoneyCents, coupon: Coupon | undefined): MoneyCents {
  if (!coupon) return 0;
  if (coupon.kind === "FIXED") {
    return Math.min(coupon.amountOffCents, subtotalCents);
  }
  const raw = Math.floor((subtotalCents * coupon.percentOff) / 100);
  return Math.min(raw, subtotalCents);
}
