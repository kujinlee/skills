# Day 1 Checklist: Checkout Consolidation Refactor

**Related issue:** [Refactor checkout into deep module boundaries](https://github.com/kujinlee/skills/issues/2)  
**Scope for Day 1:** Commits 1-3 only (baseline protection + contract introduction)  
**Day 1 objective:** End with tests green and no unintended runtime behavior drift.

---

## Review rubric (strict pre-Day-2 gate)

Use this section to validate Day 1 completion quality before starting Day 2.

### Required review outputs

- [ ] Severity-ordered findings (`critical`, `high`, `medium`, `low`)
- [ ] Missing characterization or boundary tests
- [ ] Contract-scaffolding risks in introduced types
- [ ] Checklist text edits (exact bullet replacements, not just advice)
- [ ] Final Go / No-go for Day 2 start

### Hard pass/fail criteria

**No-go if any of these are true:**

- [ ] Existing checkout behavior is not characterized at public boundaries.
- [ ] Day 1 introduced runtime behavior changes instead of test + contract scaffolding.
- [ ] Loyalty expectations are absent from tests (at least as pending/explicit placeholders).
- [ ] New canonical contract types are missing or too vague to guide Day 2.
- [ ] Test suite is not green on latest Day 1 commit.

**Go only if all are true:**

- [ ] `computeCheckout` characterization covers baseline totals, coupon behavior, receipt output, and invalid-input behavior.
- [ ] `runCheckout` side-effect behavior is characterized at current boundary.
- [ ] Loyalty characterization tests exist and are explicit about pending scope.
- [ ] Canonical contract scaffolding exists (`PriceOrderInput`, `PricingSnapshot`, receipt/quote contracts).
- [ ] Latest Day 1 state is test-green and lints clean for touched files.

### Suggested review prompt

```text
Review Day 1 completion against this rubric.
Use:
- examples/skill-playground/docs/CHECKLIST-day-1-checkout-refactor.md
- examples/skill-playground/tests/checkout.test.ts
- examples/skill-playground/src/checkout/types.ts

Return:
1) Severity-ordered findings
2) Missing tests/coverage
3) Contract risks
4) Exact checklist bullet edits
5) Final Go/No-go for Day 2
```

---

## Preflight (15 minutes)

- [ ] Pull latest branch and confirm clean working tree for targeted files.
- [ ] Re-read issue #2 commit plan and lock scope: no production behavior changes today.
- [ ] Decide temporary naming for canonical contract types (stable enough for follow-up commits).
- [ ] Confirm process guardrail: tests must be green after every commit.

---

## Commit 1: Characterization tests for current behavior

- [ ] Add tests that pin current `computeCheckout` behavior:
  - [ ] valid simple cart totals
  - [ ] coupon discount behavior (percent/fixed as currently supported)
  - [ ] receipt lines shape/text expectations (as-is)
  - [ ] invalid input behavior (email/cart)
- [ ] Add tests pinning current `runCheckout` side-effect behavior (email invocation contract).
- [ ] Run relevant test suite and confirm green.
- [ ] Commit with intent like: `test: add checkout characterization coverage`.

### Exit criteria

- [ ] Existing behavior is captured at public boundaries.
- [ ] Test suite is green.

---

## Commit 2: Loyalty characterization tests (boundary-focused)

- [ ] Add characterization tests for loyalty outcomes from PRD examples:
  - [ ] no-coupon baseline points
  - [ ] percent-coupon effect on qualifying spend and points
  - [ ] multiplier scenario behavior
  - [ ] floor rounding and non-negative constraints
  - [ ] tax/shipping exclusion semantics (as represented in current model)
- [ ] Keep tests focused on external behavior, not internals.
- [ ] Run tests and ensure acceptable status (green, or explicitly marked TODO/skip if not implemented yet).
- [ ] Commit with intent like: `test: add loyalty characterization cases`.

### Exit criteria

- [ ] Loyalty expectations are explicit in tests.
- [ ] Test suite is green at commit boundary.

---

## Commit 3: Canonical pricing contract types (no rewiring)

- [ ] Introduce `PricingSnapshot`-style type(s) and related contract types.
- [ ] Include planned loyalty fields in contract shape (optional initially if needed for compatibility).
- [ ] Do not rewire runtime logic yet; this commit is contract scaffolding only.
- [ ] Add minimal compile/type usage assertion if useful.
- [ ] Run tests and confirm green.
- [ ] Commit with intent like: `refactor: introduce canonical pricing snapshot types`.

### Exit criteria

- [ ] Canonical contract exists and compiles.
- [ ] Runtime behavior is unchanged.
- [ ] Test suite is green.

---

## Day 1 guardrails

- [ ] No broad file-moving churn unless required for clarity.
- [ ] No compatibility adapter rewiring yet (`computeCheckout` / `runCheckout` remain unchanged internally).
- [ ] No notifier port injection yet (starts in later commits).
- [ ] Keep diffs small and mechanical.

---

## End-of-day definition of done

- [ ] Characterization coverage for existing checkout behavior exists.
- [ ] Loyalty expectation tests are added and visible.
- [ ] Canonical pricing contract type(s) are introduced.
- [ ] Latest commit is green and codebase is working.
