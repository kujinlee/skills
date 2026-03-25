import { applyDiscount } from "./applyDiscount.js";
import { calculateSubtotal } from "./calculateSubtotal.js";
import { formatReceiptLine } from "./formatReceiptLine.js";
import { sendCheckoutConfirmationEmail } from "./sendConfirmationEmail.js";
import type { CheckoutInput, CheckoutResult } from "./types.js";
import { validateCart } from "./validateCart.js";
import { validateEmail } from "./validateEmail.js";

/** Pure pricing + validation; no I/O. Use `runCheckout` when email should be sent. */
export function computeCheckout(input: CheckoutInput): CheckoutResult {
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

  return {
    subtotalCents,
    discountCents,
    totalCents,
    receiptLines,
  };
}

export function runCheckout(input: CheckoutInput): CheckoutResult {
  const result = computeCheckout(input);
  sendCheckoutConfirmationEmail(input.email, result);
  return result;
}
