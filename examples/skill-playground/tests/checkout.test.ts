import { describe, expect, it, vi } from "vitest";
import { computeCheckout, runCheckout } from "../src/checkout/index.js";
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

  it("applies FIXED coupon and caps discount at subtotal", () => {
    const input: CheckoutInput = {
      email: "fixed@example.com",
      cart: { items: [{ sku: "A", quantity: 1, unitPriceCents: 1_000 }] },
      coupon: { kind: "FIXED", amountOffCents: 2_000 },
    };
    const r = computeCheckout(input);
    expect(r.subtotalCents).toBe(1_000);
    expect(r.discountCents).toBe(1_000);
    expect(r.totalCents).toBe(0);
  });

  it("formats receipt lines using current string contract", () => {
    const input: CheckoutInput = {
      email: "receipt@example.com",
      cart: {
        items: [
          { sku: "A", quantity: 2, unitPriceCents: 500 },
          { sku: "B", quantity: 1, unitPriceCents: 900, itemDiscountCents: 100 },
        ],
      },
    };
    const r = computeCheckout(input);
    expect(r.receiptLines).toEqual(["A x2 @ 500c", "B x1 @ 900c (item disc 100c ea)"]);
  });

  it("throws on invalid email", () => {
    const input: CheckoutInput = {
      email: "invalid",
      cart: { items: [{ sku: "A", quantity: 1, unitPriceCents: 100 }] },
    };
    expect(() => computeCheckout(input)).toThrowError("Invalid email");
  });

  it("throws on invalid cart", () => {
    const input: CheckoutInput = {
      email: "buyer@example.com",
      cart: { items: [] },
    };
    expect(() => computeCheckout(input)).toThrowError("Invalid cart");
  });
});

describe("runCheckout", () => {
  it("returns the same result as computeCheckout for valid input", () => {
    const input: CheckoutInput = {
      email: "buyer@example.com",
      cart: { items: [{ sku: "A", quantity: 2, unitPriceCents: 500 }] },
    };
    expect(runCheckout(input)).toEqual(computeCheckout(input));
  });

  it("sends checkout confirmation with email and computed result", async () => {
    const emailModule = await import("../src/checkout/sendConfirmationEmail.js");
    const sendSpy = vi.spyOn(emailModule, "sendCheckoutConfirmationEmail");
    const input: CheckoutInput = {
      email: "buyer@example.com",
      cart: { items: [{ sku: "A", quantity: 2, unitPriceCents: 500 }] },
    };

    const result = runCheckout(input);

    expect(sendSpy).toHaveBeenCalledTimes(1);
    expect(sendSpy).toHaveBeenCalledWith("buyer@example.com", result);
  });
});

describe("loyalty characterization (pending)", () => {
  it.skip("earns baseline points with no coupon", () => {
    // Pending Day 2+: points fields are not yet modeled in checkout result.
  });

  it.skip("computes points from post-coupon qualifying spend", () => {
    // Pending Day 2+: qualifying spend + points are not yet exposed.
  });

  it.skip("applies highest multiplier per eligible line", () => {
    // Pending Day 2+: multiplier modeling is not yet implemented.
  });

  it.skip("floors fractional points and never returns negative points", () => {
    // Pending Day 2+: points rounding and minimum are not yet implemented.
  });

  it.skip("excludes tax and shipping from qualifying spend", () => {
    // Pending Day 2+: tax/shipping are not represented in current checkout input.
  });
});
