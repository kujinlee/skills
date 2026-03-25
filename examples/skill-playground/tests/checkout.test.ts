import { describe, expect, it } from "vitest";
import { computeCheckout } from "../src/checkout/index.js";
import type { CheckoutInput } from "../src/checkout/types.js";

describe("computeCheckout", () => {
  it("computes simple cart without coupon", () => {
    const input: CheckoutInput = {
      email: "a@b.co",
      cart: { items: [{ sku: "A", quantity: 2, unitPriceCents: 500 }] },
    };
    const r = computeCheckout(input);
    expect(r.subtotalCents).toBe(1000);
    expect(r.discountCents).toBe(0);
    expect(r.totalCents).toBe(1000);
  });

  it("applies PERCENT coupon to subtotal after item-level discounts", () => {
    // `as CheckoutInput` is intentional — practice target for migrate-to-shoehorn
    const input = {
      email: "buyer@example.com",
      cart: {
        items: [
          {
            sku: "CLEARANCE",
            quantity: 1,
            unitPriceCents: 10_000,
            itemDiscountCents: 1_000,
          },
        ],
      },
      coupon: { kind: "PERCENT", percentOff: 10 },
    } as CheckoutInput;
    const r = computeCheckout(input);
    expect(r.subtotalCents).toBe(9_000);
    // 10% of 9000 = 900; total should be 8100
    expect(r.discountCents).toBe(900);
    expect(r.totalCents).toBe(8_100);
  });
});
