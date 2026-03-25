# PRD: Loyalty points at checkout

_Sourced from `docs/PRODUCT_BRIEF.md` and the current checkout domain (merchandise subtotal, order coupons, pure `computeCheckout` + separate email send). Intended to be filed as a GitHub issue._

---

## Problem

Repeat customers have no visible reward for choosing our store again. Without a clear loyalty program, we miss retention and word-of-mouth, and support cannot give a single, consistent explanation of how rewards work at checkout. Finance and product need agreed rules for how discounts interact with points so margin and liability stay predictable.

---

## Solution (High level)

Introduce **loyalty points earned per completed checkout**, computed from **qualifying spend** (after line and order-level discounts as defined in the product brief), with **whole-point** earning, optional **SKU multipliers**, and **transparent disclosure** on the receipt email.

Points accrue in the customer’s account for future use (redemption mechanics can follow in a later phase).

All earning logic runs at a **single checkout boundary** so totals, email, and tests share one behavior description.

---

## Glossary (definitions to keep consistent)

- **Line / item discount**: Markdown on a SKU (e.g. clearance), applied per line.
- **Merchandise subtotal**: Sum of line totals **after line discounts**, **before** any order-level coupon. Matches “what the cart of goods costs” before cart-wide promo.
- **Order-level coupon**: One cart-wide promotion: `PERCENT` or `FIXED` off. (At most one order coupon per order; no stacking with other order coupons per PRD.)
- **Qualifying spend (for points)**: Merchandise subtotal **after** line and order discounts; **exclude tax and shipping** from qualifying spend.
- **Whole-point earning**: Earn points by **flooring** to an integer number of points.

---

## Earning & policy rules (the “math”)

### Points formula

- **Base rate**: `1` point per `$1` of **qualifying spend**.
- **Rounding**: **floor** to integer points.
- **Minimum points per order**: `0` (no negative points on an order).

### SKU multipliers

- **SKU-level multipliers** apply only to eligible products/lines when advertised.
- Multipliers apply to the qualifying spend attributed to those lines **after line discounts**.
- If multiple multipliers apply to one line: use the **single highest** multiplier only (no stacking).

### Coupon rules

- **At most one order-level coupon per order**.
- **Minimum-spend eligibility** uses merchandise subtotal **after line discounts and before the order coupon**.
- Minimum-spend offers do not stack with other order coupons.
- For percent-off order coupons: points are calculated on **post-coupon** merchandise spend (per brief).

### Checkout boundary (single-source-of-truth)

- Extend the checkout result (or adjacent loyalty result) so a single computation produces:
  - `subtotal` (merchandise subtotal)
  - `discount` (order discount)
  - `qualifying spend`
  - `points earned`
  - `multiplier breakdown`
- Receipt email and APIs must consume this structured result.
- No duplicate point math should live in the email template layer.

---

## User stories (grouped by role; numbering preserved)

### Customers / Shoppers

1. As a **returning shopper**, I want to **see how many points I earned on this order**, so that I feel recognized for shopping again.
2. As a **shopper**, I want **points to reflect what I actually paid for merchandise after discounts**, so that the program feels fair when I use coupons or buy clearance items.
3. As a **shopper**, I want **bonus points on eligible products** when advertised, so that promotions are easy to understand at checkout.
4. As a **shopper**, I want **the receipt email to list subtotal, discounts, qualifying spend, and points earned**, so that I can verify the math without contacting support.
5. As a **shopper**, I want **no negative points on an order**, so that edge cases with refunds or heavy discounts do not confuse me.
6. As a **new shopper**, I want **clear copy explaining the earning rule in plain language**, so that I know what “qualifying spend” means before I opt in or create an account.
19. As a **shopper using a percent-off order coupon**, I want **points calculated on post-coupon merchandise spend** (per brief), so that my rewards align with what I paid for goods.
20. As a **compliance-minded stakeholder**, I want **out-of-scope items** (tax, shipping) explicitly excluded from qualifying spend, so that policy is clear in PRD and UI.

### Support agent

7. As a **support agent**, I want **one support one-liner and a short glossary** aligned with engineering, so that I can explain outcomes without opening tickets to engineering.
8. As a **support agent**, I want **receipt emails to include enough line items to reconstruct points**, so that I can resolve “missing points” disputes from the email alone when possible.

### Finance stakeholder

9. As a **finance stakeholder**, I want **points based on qualifying spend after discounts** with **documented rounding (floor to whole points)**, so that liability matches policy.
10. As a **finance stakeholder**, I want **at most one order-level coupon per order** and **no stacking of minimum-spend with other order coupons**, so that promotional cost stays bounded.

### Marketer

11. As a **marketer**, I want **SKU-level multipliers** to apply only to eligible lines, so that double-points campaigns are targeted and measurable.
12. As a **marketer**, I want **minimum-spend thresholds evaluated on merchandise subtotal after line discounts and before the order coupon**, so that “spend $50” campaigns match customer expectations.

### Product manager

13. As a **product manager**, I want **canonical examples** (no coupon, percent coupon, double-SKU) as acceptance references, so that QA and engineering share the same truth.

### Engineer / Platform

14. As an **engineer**, I want **earning computed in a pure function or module** separate from email and persistence, so that unit tests stay fast and deterministic.
15. As an **engineer**, I want **checkout to expose merchandise subtotal, order discount, qualifying spend, and points in one place**, so that API, email, and future UI do not duplicate formulas.
16. As an **engineer**, I want **idempotent or safely repeatable earning on order completion**, so that retries do not double-credit points.
17. As a **platform owner**, I want **auditability** (order id, timestamp, points earned, rule version), so that we can investigate disputes and comply with internal controls.
18. As a **customer with multiple items**, I want **multipliers to use the highest applicable multiplier per line when rules overlap**, so that I am not surprised by compounding bonuses.

---

## Implementation decisions (important constraints)

- **Domain language** matches the product brief: merchandise subtotal (after line discounts, before order coupon), order-level coupon, qualifying spend for points (after line and order discounts; exclude tax and shipping).
- **Earning formula**: 1 point per $1 of qualifying spend, **floor** to integer points; minimum 0 points per order.
- **SKU multipliers**: applied per line to that line’s share of qualifying spend after line discounts; if multiple multipliers apply to one line, use the **single highest** multiplier only.
- **Coupons**: at most one order-level coupon; minimum-spend eligibility uses merchandise subtotal after line discounts, before order coupon; minimum-spend offers do not stack with other order coupons.
- **Checkout boundary**: Extend the checkout result (or adjacent loyalty result) so a single computation produces **subtotal, discount, qualifying spend, points earned, multiplier breakdown**, consumable by receipt email and APIs.
- **Email**: Receipt pipeline consumes the same structured result as tests; no duplicate point math in the email template layer.
- **Persistence**: Loyalty balance updates through a dedicated service or module (ledger-style record per order) with order identifier for deduplication.
- **Catalog / eligibility**: SKU multiplier eligibility comes from product metadata (e.g. flag or campaign id on SKU) — exact storage TBD with catalog owners.
- **No file paths or code layout** in this PRD; implementation may consolidate or split modules as long as the public checkout+loyalty behavior stays single-sourced.

---

## Testing decisions

- **Good tests** assert **observable outcomes** through the public checkout/loyalty API: qualifying spend, points, and receipt-facing fields — not private helpers or file layout.
- **Modules to test**:
  - Loyalty earning calculator (pure)
  - Integration-style tests from checkout input to full result including points (where the pipeline is wired)
- **Prior art**: Existing checkout tests that target **pure computation** without side effects (no email); extend with cases from the brief’s canonical examples and edge cases (floor rounding, 0 points, multi-line with mixed multipliers).
- **Regression**: Golden or table-driven cases for the three canonical examples plus at least one multi-line multiplier case.

---

## Out of scope

- Redeeming points for discounts or cash (wallet, checkout redemption flows).
- Tiered membership, expiration policies, and promotional bonus campaigns beyond SKU multipliers and documented order coupons.
- Tax and shipping calculation engines (only exclusion from qualifying spend).
- Full CRM or email marketing platform redesign (receipt may remain minimal HTML with required fields).
- International currency and non-USD rounding rules unless explicitly added later.

---

## Further notes

- Product brief already aligns **minimum spend** and **qualifying spend** definitions; any change to “points before vs after order coupon” must be a deliberate revision with finance sign-off.
- If `gh issue create` is preferred, paste this document into a new issue on the target repo after `gh auth login`.
