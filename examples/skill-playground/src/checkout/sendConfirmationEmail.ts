import type { CheckoutResult } from "./types.js";

/** Pretend email — real system would I/O here */
export function sendConfirmationEmail(email: string, body: string): void {
  void email;
  void body;
}

/** Sends receipt email after checkout; call separately from `computeCheckout` so tests stay pure. */
export function sendCheckoutConfirmationEmail(email: string, result: CheckoutResult): void {
  sendConfirmationEmail(email, `Total: ${result.totalCents}`);
}
