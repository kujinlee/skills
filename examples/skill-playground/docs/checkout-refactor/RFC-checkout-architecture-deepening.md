# RFC: Checkout architecture deepening (`src/checkout/`)

**Status:** Draft (exploration — no implementation committed)  
**Scope:** `examples/skill-playground/src/checkout/`  
**Related:** `examples/skill-playground/docs/PRD-loyalty-program.md` (single checkout boundary, structured result for email/tests)
**Tracking issue:** [Refactor checkout into deep module boundaries](https://github.com/kujinlee/skills/issues/2)

---

## 1. Context

The skill-playground checkout module is intentionally split across many small files (`calculateSubtotal`, `applyDiscount`, validators, `formatReceiptLine`, `runCheckout`, `sendConfirmationEmail`). That layout is useful for practicing refactors, but it also surfaces **architectural friction**: understanding “what checkout does” requires bouncing across files, and **email** only sees `totalCents` while `**computeCheckout`** builds richer `receiptLines` — a drift risk when loyalty and receipt requirements land.

This document records **deepening candidates** (John Ousterhout-style “deep modules”: small public surface, more complexity hidden inside) and a **recommended RFC direction** aligned with the loyalty PRD’s “single checkout boundary.”

---

## 2. Current layout (summary)


| Piece                                  | Role                                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `runCheckout.ts`                       | Validates → subtotal → receipt line strings → discount → total; `computeCheckout` (pure), `runCheckout` (+ email). |
| `calculateSubtotal.ts`                 | Line totals including per-line discount semantics.                                                                 |
| `applyDiscount.ts`                     | Order-level coupon on merchandise subtotal.                                                                        |
| `validateCart.ts` / `validateEmail.ts` | Thin validation; `computeCheckout` throws on failure.                                                              |
| `formatReceiptLine.ts`                 | Per-line receipt strings.                                                                                          |
| `sendConfirmationEmail.ts`             | Side effect; body is ``Total: ${result.totalCents}`` only.                                                         |
| `types.ts`                             | Shared types.                                                                                                      |


**Tests:** `tests/checkout.test.ts` exercises `**computeCheckout` only** (good boundary, no I/O).

---

## 3. Friction (why deepen)

1. **Vertical slice (“what does this order cost?”)** is spread across many modules; the **contract** (subtotal → order discount → total) exists only implicitly in orchestration order.
2. **Presentation is fused into pricing:** `computeCheckout` builds `receiptLines: string[]` while **email ignores** most of the result — hard to extend with qualifying spend, points, and line detail without duplicating logic (contrary to PRD).
3. **Validators are very shallow** and throw generic errors; admission policy is scattered.
4. `**runCheckout` hard-codes** `sendCheckoutConfirmationEmail` — no port; full “complete checkout” is awkward to test with a fake notifier.

---

## 4. Deepening candidates

### Candidate A — Pricing core (deep module)

- **Cluster:** `calculateSubtotal.ts`, `applyDiscount.ts`, and the money pipeline portion of `runCheckout.ts` (plus relevant types).
- **Why coupled:** Order discount is defined only on the same subtotal that line math produces; the invariant is today visible only in the orchestrator’s call order.
- **Dependency category:** **In-process** (pure money + coupon).
- **Test impact:** Prefer one public `**priceOrder`**-style API (name TBD) with table-driven tests; stop exporting tiny helpers if they become implementation details.

### Candidate B — Checkout completion with a port (orchestration)

- **Cluster:** `runCheckout.ts`, `sendConfirmationEmail.ts`, and callers of `runCheckout`.
- **Why coupled:** “Complete order” = deterministic pricing + **notify**; notify is a direct import today.
- **Dependency category:** **Ports & adapters** / **mock at boundary** for email.
- **Test impact:** One test: `completeCheckout(input, { notify })` with in-memory spy; keep inner pricing pure.

### Candidate C — Receipt / email view model (deep module)

- **Cluster:** `formatReceiptLine.ts`, `sendCheckoutConfirmationEmail`, and `receiptLines` construction in `computeCheckout`.
- **Why coupled:** Receipt text and email body are both **views** of checkout outcome; they should consume **one structured DTO**, not re-derive from partial fields.
- **Dependency category:** **In-process** builder + optional **port** for send.
- **Test impact:** Golden/snapshot tests on `**buildReceiptPayload`** (or similar); core returns structured numbers + line facts, not ad hoc strings, *or* the builder owns all strings exclusively.

### Candidate D — Validation as a single gate

- **Cluster:** `validateEmail.ts`, `validateCart.ts`, early guards in `computeCheckout`.
- **Why coupled:** Single use case, two files + throw sites; one policy surface is clearer.
- **Dependency category:** **In-process**.
- **Test impact:** Tests on `validateCheckoutInput` → `Result` / discriminated errors instead of only throw-based pricing tests.

---

## 5. Recommended direction (A + C, PRD-aligned)

**Rationale:** Loyalty PRD requires **one computation** producing subtotal, discount, qualifying spend, points, multiplier breakdown, consumed by **email and APIs** without duplicate math. That maps naturally to a **deep pricing result** plus a **receipt view** built from it — not to stringifying inside `computeCheckout` while email reads only `totalCents`.

### 5.1 Problem (RFC body)

- Pricing **contract** is implicit across files; hard to extend without sprawl.
- **Receipt strings** and **email** are not both driven from the same structured artifact — drift risk as requirements grow.
- **Email** and **full checkout** are not testable as a seam without module-level mocking.

### 5.2 Proposed direction (interface sketch — not final)

Two deep seams (one PR or two):

1. `**priceOrder(input: { cart; coupon? }) → PricingResult*`* (pure)
  - Owns: merchandise subtotal after line discounts, order discount, total; later **qualifying spend**, **points**, **multiplier breakdown** in one object.  
  - Does **not** own: SMTP, HTML templates, third-party email APIs.
2. `**buildReceiptView(pricing: PricingResult, cart: Cart) → ReceiptPayload`** (pure)
  - Owns: human-readable lines + structured fields for email/API.  
  - `**completeCheckout**` / `**runCheckout**` passes `ReceiptPayload` (or `PricingResult`) into an injected **notify** port.

Names and exact shapes are open; the **invariant** is: **one structured pricing outcome** is the single source for tests, HTTP responses, and email composition.

### 5.3 Dependency strategy

- **In-process:** pricing, receipt building, merged validation (if Candidate D is adopted).
- **Email:** Injected `**notifyCustomer(payload)`** (or equivalent) from `runCheckout` / `completeCheckout` so tests use a no-op or spy without patching modules.

### 5.4 Testing strategy

- **New boundary tests:** Table-driven `**priceOrder`** (current coupon + line discount cases; future loyalty cases). Optional golden tests on `**buildReceiptView**` once stable.
- **Old tests to thin or remove:** Isolated tests for `**applyDiscount`** / `**calculateSubtotal**` if they become non-exported implementation details of `**priceOrder**`.
- **Environment:** Vitest only; in-memory notify double for orchestration tests.

### 5.5 Implementation recommendations (durable, path-agnostic)

- **Own:** Merchandise subtotal (after line discounts), order discount, totals, and (when added) loyalty fields — **before** any template layer recomputes money.
- **Hide:** Line iteration, coupon branching, and receipt string rules behind the boundaries above (or one facade delegating internally).
- **Expose:** Stable **typed / JSON-serializable** result for API + email consumers.
- **Migrate callers:** Optionally keep `**computeCheckout`** as a thin wrapper over `**priceOrder` + `buildReceiptView**` until naming stabilizes.

---

## 6. Next steps (for humans)

Pick **one** candidate to implement first, or combine:


| Priority driver                              | Start with                      |
| -------------------------------------------- | ------------------------------- |
| Loyalty + receipt email truth                | **A + C**                       |
| Testable end-to-end checkout with fake email | **B** (often together with A/C) |
| Cleaner errors before pricing changes        | **D**                           |


After choice, run the **improve-codebase-architecture** workflow: parallel interface sketches (minimal vs flexible vs default-path-optimized), compare, then `**gh issue create`** with the chosen design if this RFC is promoted to tracked work.

---

## 7. Revision history


| Date       | Note                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 2026-03-25 | Initial draft from codebase exploration (candidates + RFC skeleton).                                            |
| 2026-03-25 | Section 8: Alternative public APIs for **A + C** (pricing core + receipt view).                                 |
| 2026-03-25 | Section 8: Expanded rationale for Design 5 recommendation (three exports, loyalty on snapshot, legacy adapter). |


---

## 8. Alternative public APIs (Candidates **A** + **C** only)

These designs **hide** today’s split (`calculateSubtotal`, `applyDiscount`, `formatReceiptLine`, orchestration in `runCheckout`, etc.) behind a **small exported surface**. They assume **validation** still happens somewhere: either **inside** these entry points (throw / Result) or via a separate future Candidate **D** — each option notes that choice.

**Shared idea:** **A** produces a **structured pricing snapshot** (numbers + per-line facts). **C** turns that snapshot (+ cart context) into **receipt-oriented output** (lines, sections, email-ready fields) **without recomputing money**.

Below, types are illustrative; names can change.

### 8.1 Vocabulary (portable across options)

```ts
// Inputs (same information as today’s CheckoutInput minus email if pricing is email-agnostic)
type PriceOrderInput = { cart: Cart; coupon?: Coupon };

// A: single source of truth for money (extend later for loyalty per PRD)
type PricingSnapshot = {
  merchandiseSubtotalCents: number; // after line discounts, before order coupon
  orderDiscountCents: number;
  totalMerchandiseCents: number; // after order coupon (today: subtotal - order discount)
  /** Future PRD: qualifying spend, points, multiplier breakdown */
  // qualifyingSpendCents?: number;
  // pointsEarned?: number;
  lineItems: Array<{
    sku: string;
    quantity: number;
    lineSubtotalCents: number; // after line discount for that line
  }>;
};

// C: what templates, API, and email consume (no second pricing pass)
type ReceiptView = {
  summary: {
    merchandiseSubtotalCents: number;
    orderDiscountCents: number;
    totalMerchandiseCents: number;
  };
  lineSummaries: Array<{ label: string; detail?: string }>; // human-facing, not the only truth
  plainTextBody: string; // one block for simple mailers
  /** Optional: structured blocks for HTML/React without parsing strings */
  blocks?: Array<{ kind: "line" | "divider" | "total"; text: string }>;
};
```

---

### Design 1 — **Minimal surface** (two entry points)

**Goal:** Smallest API: price once, render once. Callers compose email / HTTP themselves.

```ts
export function priceOrder(input: PriceOrderInput): PricingSnapshot;
export function receiptFromPricing(pricing: PricingSnapshot, cart: Cart): ReceiptView;
```

**Usage**

```ts
const pricing = priceOrder({ cart, coupon });
const receipt = receiptFromPricing(pricing, cart);
// Email layer: send(receipt.plainTextBody) or map receipt.blocks → HTML
```

| Hides | Line math, coupon rules, line formatting rules, future loyalty inside `priceOrder`; string/layout rules inside `receiptFromPricing`. |
| Validates | Typically **inside** `priceOrder` (throw) — email not needed for pricing. |
| Trade-off | Callers always write two calls; easy to forget `receiptFromPricing` if they only want numbers. |

---

### Design 2 — **Facade** (one call for the common path)

**Goal:** One function returns **both** pricing and receipt for the default integration story (API + email use the same object).

```ts
export type CheckoutQuote = { pricing: PricingSnapshot; receipt: ReceiptView };

export function quoteCheckout(input: PriceOrderInput): CheckoutQuote;
```

Optional escape hatch (still small surface):

```ts
export function quoteCheckout(input: PriceOrderInput, options?: { receipt?: false }): CheckoutQuote | PricingSnapshot;
```

| Hides | Same as Design 1, plus orchestration “always pair these two.” |
| Trade-off | Slightly larger return type; tests that only care about money still allocate receipt (cheap) or use `options`. |

---

### Design 3 — **Flexible rendering** (one pricer, many receipt modes)

**Goal:** Same `PricingSnapshot`, but **C** is explicit about output channel without exploding **A**’s types.

```ts
export function priceOrder(input: PriceOrderInput): PricingSnapshot;

export type ReceiptFormat = "plain" | "html-fragment" | "json-api";

export function renderReceipt(
  pricing: PricingSnapshot,
  cart: Cart,
  format: ReceiptFormat,
): string | object; // narrowed by overloads in real code
```

| Hides | All format-specific branching (Markdown vs HTML vs JSON field shapes) inside `renderReceipt`. |
| Trade-off | Return type is uglier without overloads; easy for `format` to become a grab-bag unless disciplined. |
| PRD fit | Good when **same snapshot** must feed **mobile API**, **email HTML**, and **support plaintext**. |

---

### Design 4 — **Optimized for the “checkout handler” caller**

**Goal:** One object that is **trivial to pass** to transport layers: implements serialization helpers so HTTP and email stay thin.

```ts
export class CheckoutPresentation {
  private constructor(readonly pricing: PricingSnapshot, readonly receipt: ReceiptView) {}
  static fromInput(input: PriceOrderInput): CheckoutPresentation;

  toApiJson(): Record<string, unknown>;
  toEmailPlainText(): string;
  // later: toEmailHtml(): string;
}
```

| Hides | Same internals as Design 1–2; additionally **how** JSON/email differ is centralized. |
| Trade-off | Class-based API is less functional; some teams avoid classes in domain code. |
| PRD fit | Strong when **one team** owns “response DTO + email body” and wants **one import**. |

---

### Design 5 — **Hybrid (recommended default for this repo)**

Combine **Design 1** (clear seams for tests) with **Design 2** as sugar:

```ts
export function priceOrder(input: PriceOrderInput): PricingSnapshot;
export function receiptFromPricing(pricing: PricingSnapshot, cart: Cart): ReceiptView;
export function quoteCheckout(input: PriceOrderInput): { pricing: PricingSnapshot; receipt: ReceiptView };
```

`quoteCheckout` is literally `const pricing = priceOrder(input); return { pricing, receipt: receiptFromPricing(pricing, input.cart) };`.

| Hides | Full pipeline; tests can target **only** `priceOrder` or **only** `receiptFromPricing` with a **fixture** `PricingSnapshot`. |
| Trade-off | Three exports instead of one or two — still tiny vs today’s file surface. |

---

### Comparison (quick)


| Design                  | Entry points         | Best when                           | Risk                         |
| ----------------------- | -------------------- | ----------------------------------- | ---------------------------- |
| 1 — Minimal             | 2                    | Unit tests and strict layering      | Callers omit receipt builder |
| 2 — Facade              | 1 (+ optional flag)  | Most app code wants both            | Return blob grows            |
| 3 — Flexible render     | 2 (+ format enum)    | Many output channels                | `format` sprawl              |
| 4 — Presentation object | 1 factory            | Single owner for API + email shapes | Class / OO style             |
| 5 — Hybrid              | 3 (2 core + 1 sugar) | **PRD + tests + ergonomics**        | Slightly more exports        |


---

### Recommendation (opinionated)

Prefer **Design 5**: `**priceOrder` + `receiptFromPricing`** as the **canonical** boundaries (Candidate **A** and **C**), with `**quoteCheckout`** as the **default import** for application code. Loyalty fields extend `**PricingSnapshot` only**; receipt layer **reads** those fields and never recomputes qualifying spend or points.

**Legacy migration:** Keep `computeCheckout` as a thin adapter that builds `PriceOrderInput` from `CheckoutInput`, runs `quoteCheckout` (or `priceOrder` + receipt), and maps to today’s `CheckoutResult` shape until callers migrate.

### Expanded rationale (Design 5)

#### Why three exports if the module should be “deep”?

**Deep** here means *few concepts you have to understand*, not necessarily *one function*.

- `**priceOrder`** implements **Candidate A**: everything that answers “what does this order cost under policy?” — merchandise subtotal after line discounts, order discount, total, per-line money facts; later qualifying spend, points, multipliers. No presentation strings, no email, no decorative copy.
- `**receiptFromPricing`** implements **Candidate C**: everything that answers “how do we **show** that snapshot to humans or templates?” It only **reads** `PricingSnapshot` plus `Cart` (for SKU, quantity, display context) and produces labels, `plainTextBody`, optional structured blocks, etc.

`**quoteCheckout`** is not a third source of truth. It is **sugar**: the obvious composition `priceOrder` → `receiptFromPricing`. Application code that always wants both can depend on **one** function and avoid getting the order wrong (e.g. building a receipt from stale pricing).

Typical consumers:


| Who                                                                    | What to import       |
| ---------------------------------------------------------------------- | -------------------- |
| Tests focused on money / policy                                        | `priceOrder`         |
| Tests focused on receipt copy/layout using a **fixed** pricing fixture | `receiptFromPricing` |
| HTTP handlers, “checkout preview,” most app code                       | `quoteCheckout`      |


So Design 5 is **minimal seams** plus an **ergonomic default**, not API sprawl for its own sake.

#### Loyalty fields on `PricingSnapshot` only

The loyalty PRD requires **one checkout boundary** that produces subtotal, discount, qualifying spend, points, multiplier breakdown, with **API, email, and tests** all consuming **that** structure.

If qualifying spend or points lived only on `**ReceiptView`**:

- API and email could diverge (different code paths re-deriving numbers).
- Someone might “fix” the email by changing receipt math instead of the pricing boundary.
- Tests might assert on receipt strings instead of canonical numbers.

**Rule:** `**PricingSnapshot`** is the single source of truth for **policy, money, and loyalty math**. `**ReceiptView`** is a **projection**: it formats or copies fields that already exist on the snapshot (e.g. “You earned **X** points” where **X** came from the snapshot).

**Receipt layer reads those fields and never recomputes qualifying spend or points** means: no second `floor(...)` or cart walk inside `receiptFromPricing` to derive qualifying spend. Display text uses `**pricing.qualifyingSpendCents`** (or whatever the field is named) and formatting only.

#### Legacy `computeCheckout` as a thin adapter

Callers and tests today know `**CheckoutInput**` / `**CheckoutResult**`. After refactor, the canonical API is `**PriceOrderInput**` + `**PricingSnapshot**` / `**ReceiptView**` / `**quoteCheckout**`.

Avoid a big-bang migration by keeping:

```text
computeCheckout(input: CheckoutInput): CheckoutResult
```

as a thin adapter that:

1. Validates email and cart (same behavior as today, or later unified validation — Candidate D).
2. Builds `**PriceOrderInput**` from `input.cart` and `input.coupon`.
3. Calls `**quoteCheckout(priceOrderInput)**` (or `priceOrder` + `receiptFromPricing`).
4. **Maps** the snapshot + receipt back to `**CheckoutResult`**:
  - Map `subtotalCents`, `discountCents`, `totalCents` to match **today’s semantics** (document explicitly: merchandise after line discounts vs after order coupon — naming in the new model should align with the PRD glossary).
  - Map `**receiptLines`** from `ReceiptView` (e.g. `lineSummaries` or a dedicated backward-compatible list).

Effects:

- Existing tests can keep using `**computeCheckout**` until updated.
- New code can import `**quoteCheckout**` and use the new types directly.
- The adapter **centralizes** the legacy contract and can be **deprecated** once callers migrate.

#### Extending when loyalty ships

1. Add fields to `**PricingSnapshot`** only (`qualifyingSpendCents`, `pointsEarned`, `multiplierBreakdown`, etc.), computed **inside** `priceOrder` (or helpers **private** to that boundary).
2. Extend `**receiptFromPricing`** to **read** those fields and add sections to `**ReceiptView`** / `plainTextBody`.
3. Widen `**CheckoutResult**` in the adapter if legacy callers must see loyalty fields, or expose loyalty only via `**quoteCheckout**` until migration completes.

Invariant: **one place** computes loyalty numbers; receipt code and the legacy adapter **only map or format**.

#### Summary


| Idea                                    | Purpose                                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| `**priceOrder` + `receiptFromPricing`** | Clear boundaries: math/policy vs presentation; each testable on its own.             |
| `**quoteCheckout**`                     | Default for app code: always correct pairing of pricing + receipt.                   |
| **Loyalty on snapshot only**            | PRD-aligned single source of truth; no duplicate formulas in receipt code.           |
| `**computeCheckout` adapter**           | Gradual migration from `CheckoutInput` / `CheckoutResult` without a flag-day rename. |


---

### Out of scope for this section

**Candidate B** (injected `notify` / `runCheckout`) is orthogonal: any design above can wrap with `completeCheckout(input, deps)` later without changing `**PricingSnapshot`** / `**ReceiptView**`.