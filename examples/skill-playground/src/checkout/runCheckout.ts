import { applyDiscount } from "./applyDiscount.js";
import { calculateSubtotal } from "./calculateSubtotal.js";
import { formatReceiptLine } from "./formatReceiptLine.js";
import { sendConfirmationEmail } from "./sendConfirmationEmail.js";
import type { CheckoutInput, CheckoutResult } from "./types.js";
import { validateCart } from "./validateCart.js";
import { validateEmail } from "./validateEmail.js";

/**
 * Orchestrates checkout. Intentionally thin: behavior is scattered and easy to get wrong
 * when coupon math interacts with per-line discounts.
 */
export function runCheckout(input: CheckoutInput): CheckoutResult {
  if (!validateEmail(input.email)) {
    throw new Error("Invalid email");
  }
  if (!validateCart(input.cart)) {
    throw new Error("Invalid cart");
  }

  const subtotalCents = calculateSubtotal(input.cart);
  const receiptLines = input.cart.items.map(formatReceiptLine);

  const discountCents = applyDiscount(subtotalCents, input.coupon);
  const totalCents = subtotalCents - discountCents;

  sendConfirmationEmail(input.email, `Total: ${totalCents}`);

  return {
    subtotalCents,
    discountCents,
    totalCents,
    receiptLines,
  };
}
