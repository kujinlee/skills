# Review Playbook: Day 2 Checkout Refactor

**Goal:** Evaluate Day 2 refactor quality before moving to the next implementation phase.  
**Scope:** Checkout boundary consolidation (`priceOrder`, `receiptFromPricing`, `quoteCheckout`, notifier injection, compatibility wrappers).

---

## 1) Review activity checklist

### A. Commit-level inspection

- [ ] Review commit summaries:
  - [ ] `e39ac3b` (Day 2 boundary/API refactor)
  - [ ] `c4f50a7` (Day 1/Day 2 rubric docs)
  - [ ] `29dedf2` (Day 2 cleanup/status updates)
- [ ] Confirm each commit has a single intent and minimal unrelated churn.
- [ ] Confirm compatibility exports (`computeCheckout`, `runCheckout`) remain available.

Recommended commands:

```bash
git log --oneline -8
git show --stat e39ac3b c4f50a7 29dedf2
git show e39ac3b
git show c4f50a7
git show 29dedf2
```

### B. Behavior verification

- [ ] Run test suite in `examples/skill-playground`.
- [ ] Confirm legacy behavior checks are still present and passing.
- [ ] Confirm new boundary tests are present and passing.
- [ ] Confirm notifier injection path is tested with a fake/spy dependency.

Recommended commands:

```bash
cd examples/skill-playground
npm test
```

### C. Architecture conformance check

- [ ] `priceOrder` is the primary policy/money boundary.
- [ ] `receiptFromPricing` is projection-oriented and reads canonical pricing output.
- [ ] `quoteCheckout` composes A + C boundaries for default caller path.
- [ ] `completeCheckout(..., { notify })` supports side-effect injection.
- [ ] Compatibility wrappers are still functioning.

Reference docs:

- `examples/skill-playground/docs/CHECKLIST-day-2-checkout-refactor.md`
- `examples/skill-playground/docs/RFC-checkout-architecture-deepening.md`
- `examples/skill-playground/docs/ISSUE-checkout-consolidation-refactor.md`

### D. Risk assessment

- [ ] Identify behavior drift risk in legacy mapping (`PricingSnapshot` -> `CheckoutResult`).
- [ ] Identify loyalty semantics risks (qualifying spend, points, multiplier behavior).
- [ ] Identify receipt projection risks (recomputation vs projection).
- [ ] Identify missing boundary/edge-case tests.

---

## 2) Review agent prompt (ready to run)

Use this as-is with a review agent:

```text
Review Day 2 implementation quality and risks.

Scope:
- examples/skill-playground/src/checkout/
- examples/skill-playground/tests/checkout.test.ts
- examples/skill-playground/docs/CHECKLIST-day-2-checkout-refactor.md
- examples/skill-playground/docs/RFC-checkout-architecture-deepening.md
- examples/skill-playground/docs/ISSUE-checkout-consolidation-refactor.md
- commits: e39ac3b, c4f50a7, 29dedf2

Return:
1) Severity-ordered findings (critical/high/medium/low)
2) Behavior regressions vs legacy computeCheckout/runCheckout contracts
3) Architecture conformance to A+C+composition+notify-port goals
4) Missing tests / edge cases
5) Go/No-go and top 3 next actions
```

### 2.1 Actual prompt used for this repo (copy/paste)

```text
Review Day 2 implementation quality and risks.

Scope:
- examples/skill-playground/src/checkout/
- examples/skill-playground/tests/checkout.test.ts
- examples/skill-playground/docs/CHECKLIST-day-2-checkout-refactor.md
- examples/skill-playground/docs/RFC-checkout-architecture-deepening.md
- examples/skill-playground/docs/ISSUE-checkout-consolidation-refactor.md
- examples/skill-playground/docs/REVIEW-day-2-quality-gate.md
- commits: e39ac3b, c4f50a7, 29dedf2

Return:
1) Severity-ordered findings (critical/high/medium/low)
2) Behavior regressions vs legacy computeCheckout/runCheckout contracts
3) Architecture conformance to A+C+composition+notify-port goals
4) Missing tests / edge cases
5) Go/No-go and top 3 next actions

Output format:
## Findings
- Critical: ...
- High: ...
- Medium: ...
- Low: ...

## Legacy Compatibility
- computeCheckout: pass/fail + notes
- runCheckout: pass/fail + notes

## Architecture Conformance
- priceOrder boundary: pass/fail + notes
- receiptFromPricing projection: pass/fail + notes
- quoteCheckout composition: pass/fail + notes
- notify injection: pass/fail + notes

## Missing Tests
- ...

## Decision
- Go / No-go
- Top 3 next actions:
  1. ...
  2. ...
  3. ...
```

### 2.2 Plan to run subagent

1. Run a readonly `generalPurpose` subagent against the exact prompt above.
2. Ensure it reviews both code and planning docs in scope.
3. Capture the returned findings verbatim structure.
4. Apply the quality gate in Section 4 (`Go` only if all boxes qualify).

---

## 3) Required review output format

Use this template for consistency:

```md
## Findings
- Critical: ...
- High: ...
- Medium: ...
- Low: ...

## Legacy Compatibility
- computeCheckout: pass/fail + notes
- runCheckout: pass/fail + notes

## Architecture Conformance
- priceOrder boundary: pass/fail + notes
- receiptFromPricing projection: pass/fail + notes
- quoteCheckout composition: pass/fail + notes
- notify injection: pass/fail + notes

## Missing Tests
- ...

## Decision
- Go / No-go
- Top 3 next actions:
  1. ...
  2. ...
  3. ...
```

---

## 4) Quality gate decision

Only proceed if:

- [ ] No unresolved critical findings
- [ ] Legacy compatibility is pass
- [ ] Architecture conformance is pass (or explicit accepted exceptions)
- [ ] Test gaps are documented and scheduled
- [ ] Final review decision is **Go**
