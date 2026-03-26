# Day 1 Checklist: Checkout Consolidation Refactor

**Related issue:** [Refactor checkout into deep module boundaries](https://github.com/kujinlee/skills/issues/2)  
**Scope for Day 1:** Commits 1-3 only (baseline protection + contract introduction)  
**Day 1 objective:** End with tests green and no unintended runtime behavior drift.

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
