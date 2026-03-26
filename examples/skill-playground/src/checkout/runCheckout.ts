import { applyDiscount } from "./applyDiscount.js";
import { calculateSubtotal } from "./calculateSubtotal.js";
import { formatReceiptLine } from "./formatReceiptLine.js";
import { sendCheckoutConfirmationEmail } from "./sendConfirmationEmail.js";
import type {
  CheckoutInput,
  CheckoutNotifier,
  CheckoutQuote,
  CheckoutResult,
  PriceOrderInput,
  PricingSnapshot,
  ReceiptView,
} from "./types.js";
import { validateCart } from "./validateCart.js";
import { validateEmail } from "./validateEmail.js";

export function priceOrder(input: PriceOrderInput): PricingSnapshot {
  const merchandiseSubtotalCents = calculateSubtotal(input.cart);
  const orderDiscountCents = applyDiscount(merchandiseSubtotalCents, input.coupon);
  const totalMerchandiseCents = merchandiseSubtotalCents - orderDiscountCents;

  const qualifyingSpendCents = Math.max(0, totalMerchandiseCents);

  const baseLineItems = input.cart.items.map((item) => {
    const lineSubtotalCents = item.quantity * (item.unitPriceCents - (item.itemDiscountCents ?? 0));
    const allocationRatio = merchandiseSubtotalCents > 0 ? lineSubtotalCents / merchandiseSubtotalCents : 0;
    const lineQualifyingCents = Math.floor(qualifyingSpendCents * allocationRatio);
    return {
      sku: item.sku,
      quantity: item.quantity,
      lineSubtotalCents,
      lineQualifyingCents,
      receiptLabel: formatReceiptLine(item),
    };
  });

  // Preserve total allocation by assigning rounding remainder to the last line.
  const allocatedBeforeLast = baseLineItems
    .slice(0, -1)
    .reduce((sum, item) => sum + item.lineQualifyingCents, 0);
  const lineItems =
    baseLineItems.length === 0
      ? []
      : baseLineItems.map((item, index) =>
          index === baseLineItems.length - 1
            ? { ...item, lineQualifyingCents: Math.max(0, qualifyingSpendCents - allocatedBeforeLast) }
            : item,
        );

  const weightedPointsBaseCents = lineItems.reduce((sum, line, index) => {
    const multiplier = Math.max(1, input.cart.items[index]?.pointsMultiplier ?? 1);
    return sum + line.lineQualifyingCents * multiplier;
  }, 0);
  const pointsEarned = Math.max(0, Math.floor(weightedPointsBaseCents / 100));

  const multiplierBreakdown = input.cart.items
    .filter((item) => (item.pointsMultiplier ?? 1) > 1)
    .map((item) => ({
      sku: item.sku,
      multiplier: item.pointsMultiplier ?? 1,
      appliedToCents:
        lineItems.find((line) => line.sku === item.sku)?.lineQualifyingCents ??
        item.quantity * (item.unitPriceCents - (item.itemDiscountCents ?? 0)),
    }));

  return {
    merchandiseSubtotalCents,
    orderDiscountCents,
    totalMerchandiseCents,
    qualifyingSpendCents,
    pointsEarned,
    multiplierBreakdown,
    lineItems,
  };
}

export function receiptFromPricing(pricing: PricingSnapshot, input: PriceOrderInput): ReceiptView {
  void input;
  const lineSummaries = pricing.lineItems.map((item) => ({ label: item.receiptLabel }));
  const pointsLine = `Points earned: ${pricing.pointsEarned ?? 0}`;
  const qualifyingLine = `Qualifying spend: ${pricing.qualifyingSpendCents ?? pricing.totalMerchandiseCents}c`;

  return {
    summary: {
      merchandiseSubtotalCents: pricing.merchandiseSubtotalCents,
      orderDiscountCents: pricing.orderDiscountCents,
      totalMerchandiseCents: pricing.totalMerchandiseCents,
      qualifyingSpendCents: pricing.qualifyingSpendCents,
      pointsEarned: pricing.pointsEarned,
    },
    lineSummaries,
    plainTextBody: [`Total: ${pricing.totalMerchandiseCents}`, qualifyingLine, pointsLine].join("\n"),
    blocks: [
      { kind: "line", text: qualifyingLine },
      { kind: "line", text: pointsLine },
      { kind: "total", text: `Total: ${pricing.totalMerchandiseCents}` },
    ],
  };
}

export function quoteCheckout(input: PriceOrderInput): CheckoutQuote {
  const pricing = priceOrder(input);
  const receipt = receiptFromPricing(pricing, input);
  return { pricing, receipt };
}

function toLegacyResult(quote: CheckoutQuote): CheckoutResult {
  return {
    subtotalCents: quote.pricing.merchandiseSubtotalCents,
    discountCents: quote.pricing.orderDiscountCents,
    totalCents: quote.pricing.totalMerchandiseCents,
    receiptLines: quote.receipt.lineSummaries.map((line) => line.label),
  };
}

function assertValidInput(input: CheckoutInput): void {
  if (!validateEmail(input.email)) {
    throw new Error("Invalid email");
  }
  if (!validateCart(input.cart)) {
    throw new Error("Invalid cart");
  }
}

const defaultNotifier: CheckoutNotifier = ({ email, legacyResult }) => {
  sendCheckoutConfirmationEmail(email, legacyResult);
};

/** Pure pricing + validation; no I/O. Use `runCheckout` when email should be sent. */
export function computeCheckout(input: CheckoutInput): CheckoutResult {
  assertValidInput(input);
  return toLegacyResult(quoteCheckout({ cart: input.cart, coupon: input.coupon }));
}

export function completeCheckout(
  input: CheckoutInput,
  deps?: { notify?: CheckoutNotifier },
): { quote: CheckoutQuote; result: CheckoutResult } {
  assertValidInput(input);
  const quote = quoteCheckout({ cart: input.cart, coupon: input.coupon });
  const result = toLegacyResult(quote);
  (deps?.notify ?? defaultNotifier)({ email: input.email, quote, legacyResult: result });
  return { quote, result };
}

export function runCheckout(input: CheckoutInput): CheckoutResult {
  return completeCheckout(input).result;
}
