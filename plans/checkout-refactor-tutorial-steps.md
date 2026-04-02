# Tutorial: intermediate steps from baseline to fully refactored checkout

> **Repository layout:** This **skills** clone no longer contains `examples/`. The published tutorial is **[kujinlee/agent-skills-playground](https://github.com/kujinlee/agent-skills-playground)**. Commands below that use `git archive … examples/skill-playground` apply to a clone of **[mattpocock/skills](https://github.com/mattpocock/skills)** (or any commit that still has that path).

This designs **snapshot-friendly steps** from **`examples/skill-playground` @ `7c7228d`** to **current `main`** (paths exist in **[mattpocock/skills](https://github.com/mattpocock/skills)** history). Use it to build `snapshots/01-…` … in **[kujinlee/agent-skills-playground](https://github.com/kujinlee/agent-skills-playground)** (see `checkout-refactor-ideal-teaching-order.md` for pins and hybrid **03**).

**Ideal teaching order (pedagogy-first, hybrid snapshot for step 03):** see **`checkout-refactor-ideal-teaching-order.md`**.

**Principles**

- Each step has a **learning objective**, **primary skills**, **artifacts** (optional), and a **code milestone**.
- Steps are **fewer than git commits**; replay with `git archive <commit> examples/skill-playground` (see *Approx. source commits*).

---

## Why there was a “day1” slug but not “day2” (earlier draft)

The **ISSUE** and **checklists** literally say **Day 1** (characterization + types) vs **Day 2** (deep boundaries + completion). The first tutorial draft named step 03 **`day1-characterization`** to match that label, but named the next steps **`checklists-rubrics`** and **`deep-boundaries`** instead of **`day2-…`**. That was **arbitrary and asymmetric**: “Day 2” refactor work was folded into **`deep-boundaries`**, and the **Day 2 checklist** was grouped with **Day 1 checklist** under **`checklists-rubrics`**, so no **`day2-*`** slug appeared.

**Fix:** use explicit **`day2-*`** for the refactor slice below, and merge related steps so naming stays balanced.

---

## Step map (combined, recommended)

| Step | Slug | Learner outcome | Primary skills | Artifacts (typical) | Code milestone |
|------|------|-----------------|----------------|---------------------|----------------|
| **00** | `baseline` | Original flawed example | — | `PRODUCT_BRIEF.md` only | `runCheckout` only; shallow modules; 2 tests |
| **01** | `product-and-design` | Product docs + plan + issue + RFC in one arc | **write-a-prd**, **prd-to-plan**, **request-refactor-plan**, **improve-codebase-architecture**, **design-an-interface** | PRD, loyalty plan, brief, `ISSUE-…`, `RFC-…` | **`src/checkout/index.ts`** already re-exports **`computeCheckout`** + email helper; tests expand (same as git `1fdb32d`) |
| **02** | `day1-characterization` | Anchor behavior with tests + scaffolding | **tdd** | Start `CHECKLIST-day-1` | Characterization tests; types toward snapshot shape |
| **03** | `day1-day2-gates` | Both checklists + strict rubrics before big refactor | **grill-me** (optional), review | `CHECKLIST-day-1` + `CHECKLIST-day-2` + rubrics | **Teaching goal:** still no `priceOrder` / deep API. **Git order differs** — see *Alignment* and *History caveat*. |
| **04** | `day2-deep-boundaries` | **Day 2** implementation: deep modules + adapters + DI | **tdd**, **improve-codebase-architecture** | — | `priceOrder`, `receiptFromPricing`, `quoteCheckout`, `completeCheckout`; thin `computeCheckout` / `runCheckout` |
| **05** | `loyalty-and-regression` | Loyalty semantics + hardening tests | **tdd**, **triage-issue** (optional) | — | Qualifying spend, points, multiplier; notifier/compat tests |
| **06** | `review-and-organize` | Quality gate + move docs under `checkout-refactor/` + summary | Manual / **grill-me** | `REVIEW-…`, `SUMMARY-…`, folder layout | Code stable |
| **07** | `migrate-shoehorn` | Safer test fixtures | **migrate-to-shoehorn** | — | `@total-typescript/shoehorn` in tests |

**Merges vs the long 10-step version**

- **01** = old **01 + 02** (product + design docs together).
- **03** = old **04** only, but renamed to **`day1-day2-gates`** so both **Day 1** and **Day 2 checklists** are explicit in the slug (not only “day1”).
- **05** = old **06 + 07** (loyalty + regression).
- **04** = old **05**, renamed **`day2-deep-boundaries`** so **Day 2** has a clear slug.

---

## Approx. source commits (this repo)

| Step | Commits (highlights) |
|------|----------------------|
| 00 | `7c7228d` |
| 01 | `358e8ef`, `1197d3a`, `1fdb32d` |
| 02 | `2f3779c` |
| 03 | `c4f50a7` (adds rubrics + Day 2 checklist — **parent is already** `e39ac3b`); `29dedf2` tightens Day 2 labels **next** (before loyalty `92342b4`) |
| 04 | `e39ac3b` |
| 05 | `92342b4`, `854cd78` |
| 06 | `362acb5`, `606f43e`, `2d124aa` |
| 07 | `4bb070f` |

---

## Dependency order

```text
baseline
  → product-and-design
  → day1-characterization
  → day1-day2-gates
  → day2-deep-boundaries
  → loyalty-and-regression
  → review-and-organize
  → migrate-shoehorn
```

---

## What “done” looks like at the end

- **API:** `priceOrder`, `receiptFromPricing`, `quoteCheckout`, `completeCheckout`, `computeCheckout`, `runCheckout` as on `main`.
- **Docs:** `docs/checkout-refactor/*`, PRD, plan (if you keep the product track).
- **Tests:** Full Vitest coverage + shoehorn where applicable.

---

## Suggested `docs/showcase/` files

One `NN-<slug>.md` per row: prompt, files touched, `npm test`, artifact links. Keep **`snapshots/00-baseline`** pinned to `7c7228d`.

---

## Alignment: tutorial steps ↔ artifacts ↔ code (this repo)

Each row is what **exists at the end of that step** if you follow the **same evolution** as `examples/skill-playground` on `main`. **Pin column** = commit whose tree you can `git archive …` to reproduce that snapshot (see *History caveat*).

| Step | Slug | Artifacts (paths under `examples/skill-playground/`) | Code / tests (what changed vs prior step) | Pin commit |
|------|------|------------------------------------------------------|---------------------------------------------|------------|
| **00** | `baseline` | `docs/PRODUCT_BRIEF.md` (short) | **`src/checkout/index.ts`** exports **`runCheckout` only**; shallow modules under `src/checkout/`; **2 tests** | `7c7228d` |
| **01** | `product-and-design` | `docs/PRD-loyalty-program.md`, `plans/loyalty-points-checkout.md`, expanded `docs/PRODUCT_BRIEF.md`, `docs/ISSUE-…`, `docs/RFC-…` (flat under `docs/` here; later moved under `docs/checkout-refactor/`) | **`src/checkout/index.ts`** adds **`computeCheckout`** + **`sendCheckoutConfirmationEmail`**; **`runCheckout.ts`** / **`sendConfirmationEmail.ts`** / **`tests/`** updated (`358e8ef`–`1fdb32d`) | `1fdb32d` |
| **02** | `day1-characterization` | `docs/CHECKLIST-day-1-checkout-refactor.md` (starts under `docs/`) | **`types.ts`** grows toward pricing snapshot; **`tests/checkout.test.ts`** characterization | `2f3779c` |
| **03** | `day1-day2-gates` | **Both** checklists + strict rubrics (as in `docs/` at **`c4f50a7`**) | **Teaching:** “gates before refactor.” **Git:** **`e39ac3b` → `c4f50a7`** — rubrics land **after** refactor, so **`c4f50a7`** tree **already includes** `priceOrder` / deep API. For a **pre-refactor** code pin, use **`2f3779c`** and **merge** checklist/rubric files from `c4f50a7` manually, or **teach steps 03 and 04** in **history order** (04 then 03). | **`c4f50a7`** (docs+code as recorded); or **`2f3779c`** + doc patch |
| **04** | `day2-deep-boundaries` | — | **`priceOrder`**, `receiptFromPricing`, `quoteCheckout`, **`computeCheckout`** / **`runCheckout`** as adapters; notifier injection | `e39ac3b` |
| **05** | `loyalty-and-regression` | — | Loyalty / qualifying spend in **`runCheckout.ts`** + **`types.ts`**; more **`tests`** (`92342b4`); notifier/compat guards (`854cd78`) | `854cd78` |
| **06** | `review-and-organize` | `docs/REVIEW-day-2-quality-gate.md`, `docs/SUMMARY-…`, then **folder** `docs/checkout-refactor/*` | Minor **`runCheckout.ts`** / **`tests`** fixes on re-review (`606f43e`); then **move-only** organize (`2d124aa`) | `2d124aa` |
| **07** | `migrate-shoehorn` | — | **`package.json`** + lock add `@total-typescript/shoehorn`; **`tests/checkout.test.ts`** uses `fromPartial` / etc. | `4bb070f` |

### Sub-step detail (step 01)

History splits product vs design across three commits; **one snapshot** that matches “all of 01” is the tree at **`1fdb32d`** (includes PRD + plan + issue + RFC). **`358e8ef`** already changes **code** (not docs-only): see files in table above.

### History caveat (teaching order vs git order)

Chronological history for `examples/skill-playground` after baseline:

`2f3779c` (Day 1 characterization) → **`e39ac3b` (Day 2 deep refactor)** → **`c4f50a7` (strict rubrics + Day 2 checklist)** → `29dedf2` (Day 2 label tweaks) → `92342b4` (loyalty) → …

- **Ideal teaching:** **gates (step 03)** before **deep refactor (step 04)**.  
- **Git:** **refactor comes first** (`e39ac3b`), then **checklist rubrics** (`c4f50a7`). So **`c4f50a7` is not** a “gates-only, pre-refactor” tree — it **includes** the refactored code.  
- **`29dedf2`** is **immediately after** `c4f50a7` and **before** loyalty (`92342b4`); it only adjusts Day 2 checklist wording.  
- **Ways to align the tutorial:** (1) **Teach 04 then 03** when replaying history literally; (2) **Cherry-pick** `c4f50a7`’s `docs/*` onto **`2f3779c`** for a synthetic “gates before refactor” snapshot; (3) **Accept** `c4f50a7` as the “gates” artifact commit and **narrate** that history landed refactor first.

### Reconstruct a snapshot

```bash
cd /path/to/skills
git archive <PIN_COMMIT> examples/skill-playground | tar -x -C /tmp
# /tmp/examples/skill-playground → copy into tutorial repo root + snapshots/NN-slug/
```
