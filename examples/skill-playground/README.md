# Skill playground

A **deliberately imperfect** mini codebase for practicing the skills in the parent repo. Nothing here is “production quality”—that’s the point.

## Quick start

```bash
cd examples/skill-playground
npm install
npm test
```

## What’s wrong on purpose

| Area | What you’ll see |
|------|-----------------|
| **Architecture** | Checkout is split across many tiny modules with a thin “orchestrator.” Easy to read one file, hard to see the real behavior. |
| **Checkout** | `computeCheckout` is pure totals; `runCheckout` adds email via `sendCheckoutConfirmationEmail`. |
| **Product spec** | `docs/PRODUCT_BRIEF.md` has concrete loyalty rules (you can still extend or challenge them in PRD / grill-me). |
| **Types** | Tests use `as` casts—usable with **migrate-to-shoehorn** if you add that skill. |

## Try a skill (copy-paste prompts)

**write-a-prd** — “Using `docs/PRODUCT_BRIEF.md` and this codebase, run the write-a-prd skill and draft a PRD for the loyalty program.”

**grill-me** — “Grill me on my plan to fix checkout by merging all of `src/checkout/*.ts` into one file.”

**prd-to-plan** / **prd-to-issues** — After you have a PRD (or the brief), “Turn this into a phased plan” or “Break into GitHub issues.”

**tdd** — “Using TDD, add support for a `minimumSpend` field on coupons (see brief). One vertical slice at a time.”

**triage-issue** — “We’re seeing wrong totals when PERCENT coupons stack with items that have an `itemDiscount`. Triage and propose a fix plan.” (You can temporarily break `computeCheckout` to simulate the bug, or review the math paths as a dry run.)

**improve-codebase-architecture** — “Explore `src/checkout/` for deepening opportunities; don’t implement yet—candidates and RFC-style output only.”

**design-an-interface** — “Propose alternative public APIs for a deepened `Checkout` module that hides today’s file split.”

**request-refactor-plan** — “Interview me and produce a tiny-commit refactor plan for consolidating checkout, then describe the GitHub issue body.”

**scaffold-exercises** — Less natural here; use when you want a new exercise tree: “Scaffold exercises under `examples/skill-playground/exercises/` for learning checkout refactors.”

**migrate-to-shoehorn** — “Replace unsafe `as` in `tests/` with @total-typescript/shoehorn.” (Add the dependency first if needed.)

## Layout

```
src/checkout/     # shallow slices + orchestrator
tests/            # Vitest; targets `computeCheckout` (no email side effects)
docs/             # product brief (loyalty rules)
```
# skills
