# Refactor Plan: Consolidate checkout into deep module boundaries

## Problem Statement

Checkout behavior is hard to understand and hard to change because pricing, receipt formatting, validation, and side effects are split across shallow modules with unclear boundaries. Logic feels scattered, bugs tend to appear at seams, and tests are fragile because they are not anchored to a small set of strong boundaries.

We need a consolidated architecture that is easier to reason about, safer to evolve, and aligned with the loyalty PRD.

## Solution

Refactor checkout into a hybrid deep-module API:

- `priceOrder` as the canonical pure pricing/loyalty boundary
- `receiptFromPricing` as the canonical pure presentation boundary
- `quoteCheckout` as the default composition API for application callers

Include loyalty fields in the consolidated pricing model now, and include email-delivery injection via a notify port in this refactor. Preserve `computeCheckout` and `runCheckout` as compatibility APIs during migration, with minimal contract churn.

## Commits

1. Add characterization tests for current checkout behavior (totals, discounting, receipt lines, validation throws, completion side effects).
2. Add characterization tests for loyalty PRD canonical examples and edge behavior (rounding, non-negative points, qualifying spend semantics).
3. Introduce `PricingSnapshot`-style canonical output shape for pricing + loyalty fields (non-disruptive type introduction).
4. Introduce `priceOrder` as a pure deep boundary and route pricing/coupon/loyalty logic through it while preserving behavior.
5. Introduce `receiptFromPricing` as a pure receipt/view builder that consumes canonical pricing output without recomputing policy math.
6. Introduce `quoteCheckout` as composition of pricing + receipt for common app usage.
7. Introduce email notify port and completion flow with dependency injection; keep a default adapter for existing behavior.
8. Convert `computeCheckout` into a thin compatibility adapter over the new boundaries, mapping to legacy result shape.
9. Convert `runCheckout` into a thin compatibility adapter over the injected completion path and default notifier.
10. Expand strong boundary tests (`priceOrder`, `receiptFromPricing`, `quoteCheckout`, completion with fake notifier).
11. Remove redundant shallow tests replaced by stable boundary tests.
12. Final cleanup/docs pass to clarify canonical interfaces and compatibility wrappers.

Each commit must keep tests green and leave the codebase in a working state.

## Decision Document

- Consolidation target is the hybrid interface set: `priceOrder`, `receiptFromPricing`, `quoteCheckout`.
- `priceOrder` owns policy/math outputs including loyalty-related fields.
- `receiptFromPricing` owns presentation formatting and must not recompute pricing or loyalty math.
- `quoteCheckout` is the default caller API for ergonomic use.
- `computeCheckout` and `runCheckout` remain as compatibility wrappers during migration.
- Email side effects are moved behind an injected notify port with a default production adapter.
- Type/interface renaming is minimized in this refactor to reduce migration risk.
- Architectural objective is deep module boundaries with small public surface and hidden implementation split.

## Testing Decisions

- Good tests assert observable behavior through public boundaries, not internal implementation details.
- Add characterization tests first before structural changes.
- Prioritize strong boundary tests for:
  - pricing + loyalty boundary behavior
  - receipt projection behavior from canonical pricing output
  - composed quote behavior
  - completion behavior with injected notifier
- Existing shallow tests may be removed once equivalent boundary coverage exists.
- Keep test suite green after every commit.

## Out of Scope

- Broad type-system renaming or large contract redesigns beyond low-risk migration needs.
- Unrelated checkout features not needed for boundary consolidation or loyalty integration.
- Non-checkout architectural changes outside the consolidation target.
- Full deprecation/removal of compatibility wrappers in this refactor (handled in later cleanup once callers migrate).

## Further Notes (optional)

- This refactor intentionally introduces deeper boundaries first, then gradually routes legacy entry points through those boundaries.
- Loyalty requirements are implemented now through the canonical pricing output to avoid future duplicate logic across API/email paths.
