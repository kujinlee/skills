# Day 2 Checklist: Checkout Consolidation Refactor

**Related issue:** [Refactor checkout into deep module boundaries](https://github.com/kujinlee/skills/issues/2)  
**Depends on:** `CHECKLIST-day-1-checkout-refactor.md` completed  
**Scope for Day 2:** Commits 4-7 (deep boundaries + composition + notify port)  
**Day 2 objective:** Introduce canonical runtime boundaries while preserving compatibility and keeping tests green after each commit.

---

## Review rubric (strict pre-implementation gate)

Use this section with a review agent before starting Day 2 and at key checkpoints.

### Required review outputs

- [ ] Severity-ordered findings (`critical`, `high`, `medium`, `low`)
- [ ] Missing test scenarios (boundary-focused)
- [ ] Compatibility risks for `computeCheckout` / `runCheckout`
- [ ] Checklist text edits (exact bullet replacements, not just advice)
- [ ] Go / No-go recommendation

### Hard pass/fail criteria

**No-go if any of these are true:**

- [ ] Any unresolved **critical** risk exists.
- [ ] Migration path for `computeCheckout` and `runCheckout` is ambiguous.
- [ ] Receipt generation can recompute pricing/loyalty math instead of reading canonical pricing fields.
- [ ] Commit sequence allows breaking behavior before characterization/boundary tests are in place.

**Go only if all are true:**

- [ ] `priceOrder` is clearly the single policy/money source of truth.
- [ ] `receiptFromPricing` is clearly projection-only from canonical pricing output.
- [ ] `quoteCheckout` composition behavior and test expectations are explicit.
- [ ] Notify port introduction preserves default behavior and is testable via injected fake.
- [ ] Each commit has explicit green-test gate and leaves the system working.

### Checkpoint cadence

- [ ] **Review #1 (required):** Before starting Commit 4.
- [ ] **Review #2 (required):** After Commit 5 (boundaries introduced, before composition + side-effect injection).
- [ ] **Review #3 (required):** After Commit 7 (end-of-day readiness and compatibility check).

### Suggested review prompt

```text
Review this Day 2 checklist using the strict rubric section in the same file.
Return:
1) Severity-ordered findings
2) Missing tests
3) Compatibility risks for computeCheckout/runCheckout
4) Exact checklist bullet edits
5) Final Go/No-go
```

---

## Preflight (10-15 minutes)

- [ ] Confirm Day 1 commit is merged/available on current branch.
- [ ] Confirm tests are currently green (`npm test` in `examples/skill-playground`).
- [ ] Confirm working tree is clean before starting new commits.
- [ ] Reconfirm migration constraints:
  - [ ] preserve `computeCheckout` and `runCheckout` public compatibility
  - [ ] minimize type/contract churn
  - [ ] include loyalty fields now
  - [ ] include email-delivery injection now

---

## Commit 4: Introduce `priceOrder` deep boundary (pure)

- [ ] Create `priceOrder` that centralizes money/policy outputs in `PricingSnapshot`.
- [ ] Route subtotal + coupon discount math through this boundary.
- [ ] Implement initial loyalty output fields in snapshot shape (as planned by PRD/tests).
- [ ] Keep old flows working (do not break `computeCheckout` caller contract yet).
- [ ] Add/adjust tests so pricing behavior is asserted at `priceOrder` boundary.
- [ ] Run tests and ensure green.
- [ ] Commit with intent like: `refactor: add pure priceOrder boundary`.

### Exit criteria

- [ ] `priceOrder` exists and is the canonical pricing computation unit.
- [ ] Test suite is green.

---

## Commit 5: Introduce `receiptFromPricing` deep boundary (pure)

- [ ] Create `receiptFromPricing(pricing, cart)` to build receipt view output.
- [ ] Ensure receipt generation reads canonical pricing fields and does not recompute pricing/loyalty math.
- [ ] Preserve current receipt compatibility expectations (existing string contracts unless intentionally staged).
- [ ] Add/adjust tests for receipt behavior at boundary level.
- [ ] Run tests and ensure green.
- [ ] Commit with intent like: `refactor: add pure receiptFromPricing boundary`.

### Exit criteria

- [ ] Receipt logic is centralized and fed by `PricingSnapshot`.
- [ ] Test suite is green.

---

## Commit 6: Introduce `quoteCheckout` composition API

- [ ] Add `quoteCheckout(input)` that composes `priceOrder` + `receiptFromPricing`.
- [ ] Return both canonical pricing and receipt outputs in one call.
- [ ] Add boundary tests for composition behavior (happy path + representative coupon path).
- [ ] Keep compatibility APIs untouched or thinly adapted without behavior change.
- [ ] Run tests and ensure green.
- [ ] Commit with intent like: `feat: add quoteCheckout composition API`.

### Exit criteria

- [ ] New default integration entrypoint exists and is test-covered.
- [ ] Test suite is green.

---

## Commit 7: Introduce notify port + injected completion flow

- [ ] Add notify interface/port for checkout completion side effects.
- [ ] Introduce completion flow that accepts injected notifier dependency.
- [ ] Keep a default notifier adapter preserving current behavior.
- [ ] Ensure `runCheckout` behavior remains compatible while internally using injected flow (or staged adapter).
- [ ] Add tests using a fake/spy notifier to verify side effects without module patching.
- [ ] Run tests and ensure green.
- [ ] Commit with intent like: `refactor: inject notify port into checkout completion`.

### Exit criteria

- [ ] Side effects are injectable and boundary-testable.
- [ ] Compatibility behavior is preserved.
- [ ] Test suite is green.

---

## Day 2 guardrails

- [ ] Do not remove compatibility wrappers yet (`computeCheckout`, `runCheckout` remain available).
- [ ] Avoid broad renames unless required for boundary clarity.
- [ ] Keep each commit independently releasable and test-green.
- [ ] Prefer adapting internals behind compatibility surfaces over caller-wide churn.

---

## End-of-day definition of done

- [ ] `priceOrder` is live and tested.
- [ ] `receiptFromPricing` is live and tested.
- [ ] `quoteCheckout` is live and tested.
- [ ] Notify port injection is live with default adapter and test coverage.
- [ ] Existing compatibility APIs still function.
- [ ] Latest commit is green and codebase is working.
