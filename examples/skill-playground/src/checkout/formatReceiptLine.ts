import type { LineItem } from "./types.js";

export function formatReceiptLine(item: LineItem): string {
  const base = `${item.sku} x${item.quantity} @ ${item.unitPriceCents}c`;
  if (item.itemDiscountCents) {
    return `${base} (item disc ${item.itemDiscountCents}c ea)`;
  }
  return base;
}
