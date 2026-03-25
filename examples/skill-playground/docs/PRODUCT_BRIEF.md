# Loyalty points at checkout

## Goal

Award **loyalty points** on checkout so repeat customers are rewarded, with rules support and engineering can explain without reading code.

## Definitions (use these terms consistently)

| Term | Meaning |
|------|--------|
| **Line / item discount** | Markdown on a SKU (e.g. clearance), applied per line. |
| **Merchandise subtotal** | Sum of line totals **after line discounts**, **before** any order-level coupon. Matches “what the cart of goods costs” before cart-wide promo. |
| **Order-level coupon** | One cart-wide promotion: `PERCENT` or `FIXED` off (not combinable with another order coupon). |
| **Qualifying spend (for points)** | Merchandise subtotal **after** line discounts **and after** the order-level coupon (if any). Points are not earned on tax or shipping. |

**Clarification:** “Pre-coupon” always means **before the order-level coupon**, not before line markdowns. Minimum-spend rules use **merchandise subtotal** (after line discounts, before order coupon).

## Earning rules

1. **Base rate:** `1` point per `$1` of **qualifying spend**, **rounded down** to whole points (no fractional points).
2. **Minimum points per order:** `0` (no negative points on an order).
3. **SKU multipliers:** Certain SKUs may earn **double points** (or other multipliers). The multiplier applies only to the qualifying spend attributed to those lines, **after** line discounts. If multiple multipliers could apply to the same line, use the **single highest** multiplier (no stacking).
4. **Order coupons:** At most **one** order-level coupon per order. **Minimum-spend** coupons do **not** stack with percent-off (or any other order coupon).

## Minimum spend (order coupons)

Evaluate minimum spend against **merchandise subtotal** — i.e. **after line-level discounts**, **before** applying the order-level coupon. Example: “Spend $50” means $50 on discounted merchandise lines, then the percent-off coupon applies.

## Receipt email (customer-visible)

Include at least:

- Merchandise subtotal (after line discounts)
- Order coupon applied (if any)
- Qualifying spend used for points
- Points earned
- Any SKU multiplier callouts

**Support one-liner:**  
“Points are earned on what you paid for merchandise after discounts; some items may earn bonus points.”

## Success criteria

- Customers see **points earned** on the receipt email with enough detail to reconcile.
- Support can explain outcomes using the definitions above **without** reading implementation code.

## Canonical examples (acceptance checks)

1. **No coupons:** $100 merchandise subtotal after line discounts → **100** points (assuming 1x SKU).
2. **Percent order coupon:** Merchandise subtotal $100, 10% off order coupon → qualifying spend **$90** → **90** points (before any SKU multiplier).
3. **Double-point SKU:** One line qualifies for **2x**; multiplier applies only to that line’s share of qualifying spend after discounts.

## Engineering note

Compute points and receipt fields at a **single checkout boundary** so email, API, and tests share one behavior description (behavior-level tests; avoid locking to internal file layout).
