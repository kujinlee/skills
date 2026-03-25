# Plan: Loyalty points at checkout

> Source PRD: `docs/PRD-loyalty-program.md` (same content as the GitHub issue filed from that doc)

## Architectural decisions

Durable decisions that apply across all phases:

- **Definitions:** Merchandise subtotal = sum of line totals after line discounts, **before** order-level coupon. Qualifying spend for points = merchandise after line discounts **and after** order coupon; **exclude** tax and shipping (out of scope for engines, but explicit in math and copy).
- **Earning:** 1 point per $1 of qualifying spend, **floor** to whole points; minimum **0** points per order.
- **SKU multipliers:** Per line, after line discounts; if several rules apply to one line, use the **single highest** multiplier only.
- **Coupons:** At most **one** order-level coupon per order. Minimum-spend eligibility uses merchandise subtotal (after line discounts, before order coupon). Minimum-spend offers **do not** stack with other order coupons.
- **Checkout boundary:** One computation produces subtotal, order discount, qualifying spend, points, and multiplier breakdown; **email and tests consume this structure** — no second copy of formulas in the template layer.
- **Pure core:** Loyalty earning logic lives in a **pure** module or function; `computeCheckout` (or equivalent) orchestrates and returns a single result object.
- **Persistence (later phases):** Ledger-style record per order with order id for **deduplication**; audit fields: order id, timestamp, points earned, rule version.
- **Catalog / eligibility (multiplier phases):** SKU multiplier eligibility comes from product metadata (e.g. flag or campaign id on SKU) — exact storage TBD with catalog owners; surface via checkout line inputs as in PRD.

## Testing alignment (per PRD)

- Assert **observable outcomes** through the public checkout/loyalty API (qualifying spend, points, receipt-facing fields) — not private helpers or file layout alone.
- **Pure** loyalty earning calculator tests plus integration-style tests from checkout input to full result where the pipeline is wired.
- **Regression:** golden or table-driven cases for the three canonical examples plus at least one multi-line multiplier case (implemented across phases as features land).

---

## Phase 1: Base points on qualifying spend (no multipliers, no order coupon)

**User stories:** 2, 9, 14, 15, 20; 5 (non-negative with simple inputs); 13 (canonical example 1); **1** (minimal — shopper sees points earned on this order via receipt/email, per PRD story 1)

### What to build

End-to-end slice: extend checkout so a cart with **line discounts only** (no order coupon) yields **qualifying spend** (equals post–line-discount merchandise total in cents, with tax and shipping excluded per PRD) and **points** = floor(qualifying spend in dollars). Expose these on the **same `CheckoutResult` (or loyalty sub-object)** used everywhere. Receipt email includes merchandise subtotal, qualifying spend, and points earned. Unit tests cover pure computation plus at least **canonical example 1** ($100 → 100 points at 1x).

**Note:** PRD story **19** (points on **post–order-coupon** spend) requires an order coupon — covered in **Phase 2**, not here.

### Acceptance criteria

- [ ] `computeCheckout` (or the public API) returns qualifying spend and points consistent with the brief; no duplicate point math outside the checkout boundary.
- [ ] Floor rounding and “no negative points” hold for this slice’s inputs.
- [ ] Confirmation email content reflects subtotal, qualifying spend, and points (tax/shipping called out as excluded if they appear in types later).
- [ ] Tests assert **observable outcomes** on the public result shape, not private helpers only.

---

## Phase 2: Order-level coupon and qualifying spend

**User stories:** **19** (primary — percent-/fixed-off order coupon, points on post-coupon merchandise spend); 2, 9; 13 (canonical example 2); 5

### What to build

Apply **one** order coupon (percent or fixed) so **qualifying spend** is post–line-discount merchandise **after** that coupon. Points = floor(qualifying spend in dollars) at 1x. Email shows order coupon and updated qualifying spend and points. Tests include **canonical example 2** ($100 merch, 10% off → $90 qualifying → 90 points).

### Acceptance criteria

- [ ] Qualifying spend matches “after order coupon” policy; points align with floored dollars.
- [ ] Receipt email lists order-level discount and resulting qualifying spend and points.
- [ ] Table-driven or golden tests for percent and fixed caps without negative totals.

---

## Phase 3: SKU multipliers (highest per line)

**User stories:** 3, 11, 18; 13 (canonical example 3); 15

### What to build

Attach **multiplier eligibility** to lines (e.g. product metadata or flags on `LineItem`). After computing per-line shares of qualifying spend (consistent with order coupon allocation), apply the **highest** multiplier per line only. Result includes enough **breakdown** for email (e.g. which lines had bonuses). Tests cover multi-line mixed multipliers and overlap rules.

### Acceptance criteria

- [ ] Multipliers apply only to eligible lines’ attributed qualifying spend; no stacking on one line.
- [ ] Checkout result exposes totals plus multiplier/breakdown needed for receipt and support.
- [ ] At least one multi-line test case beyond the three canonicals.

---

## Phase 4: Receipt depth and customer/support clarity

**User stories:** 1, 4, 6, 8 (full depth and copy vs Phase 1 minimal visibility); 7 (partial — glossary finalized in Phase 7)

### What to build

Expand the receipt email (or structured body) so customers see **subtotal, discounts, qualifying spend, points, multiplier callouts**, and enough **line context** that support can reconstruct points from the email when possible. Add short **plain-language** copy for “qualifying spend” where the shopper sees it.

### Acceptance criteria

- [ ] Email includes the fields listed in the product brief; line-level detail matches what engineering uses for disputes.
- [ ] Copy explains qualifying spend without requiring code knowledge.

---

## Phase 5: Coupon policy — minimum spend and non-stacking

**User stories:** 10, 12

### What to build

Enforce **at most one** order-level coupon per checkout input. For **minimum-spend** coupons, evaluate threshold on **merchandise subtotal after line discounts, before order coupon**. Reject or ignore invalid combinations per PRD (no stacking of min-spend with other order coupons). Tests cover threshold edge cases.

### Acceptance criteria

- [ ] Invalid coupon combinations are handled per policy with clear, test-specified behavior.
- [ ] Minimum spend is evaluated on the correct subtotal per definitions table.

---

## Phase 6: Persistence, idempotency, and audit

**User stories:** 16, 17

### What to build

On order completion, record **ledger-style** earning: order identifier, timestamp, points earned, rule version; **deduplicate** by order id so retries do not double-credit. Wire `runCheckout` (or completion handler) to this layer without moving pure math out of the single checkout boundary for tests.

### Acceptance criteria

- [ ] Repeat completion for the same order does not increase recorded points.
- [ ] Audit record supports internal investigation (ids, time, rule version).

---

## Phase 7: Support and finance alignment artifacts

**User stories:** 7 (support one-liner + glossary); **9** (documented floor rounding and liability language in glossary — earning behavior for 9 is implemented in Phases 1–2); **13** (canonical examples as shared QA references)

### What to build

Add **support one-liner** and **short glossary** (PRD-aligned) in repo docs or linked from the product brief; ensure **canonical examples** are listed as acceptance references for QA and engineering.

### Acceptance criteria

- [ ] Glossary terms match engineering definitions (merchandise subtotal, qualifying spend, order coupon).
- [ ] Canonical examples 1–3 plus at least one multi-line multiplier case are documented for regression.

---

## Out of scope (per PRD)

- Redeeming points for discounts or cash (wallet, checkout redemption flows).
- Tiered membership, expiration policies, and promotional bonus campaigns beyond SKU multipliers and documented order coupons.
- Tax and shipping calculation engines (only exclusion from qualifying spend).
- Full CRM or email marketing platform redesign (receipt may remain minimal HTML with required fields).
- International currency and non-USD rounding rules unless explicitly added later.
