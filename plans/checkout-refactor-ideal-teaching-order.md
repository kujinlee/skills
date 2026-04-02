# Checkout refactor tutorial — **ideal teaching order**

> **Repository layout:** This **skills** clone no longer contains `examples/`. The hands-on tutorial and snapshots live in **[kujinlee/agent-skills-playground](https://github.com/kujinlee/agent-skills-playground)**. To extract historic `examples/skill-playground` trees, clone **[mattpocock/skills](https://github.com/mattpocock/skills)** and run `git archive <commit> examples/skill-playground` there. Older paragraphs below may reference `examples/` in this repo or **claude-skill-playground** — prefer **agent-skills-playground** for the current published tutorial.

This is the **canonical sequence for learners**: dependency order matches **pedagogy** (characterization → **gates before big refactor** → deep boundaries → loyalty → review → shoehorn), not the order commits landed on `main`.

**Companion doc:** `checkout-refactor-tutorial-steps.md` — step slugs, skills, and **git archaeology** (where history diverges from teaching).

---

## Target repositories

| Role | Location | Notes |
|------|----------|--------|
| **Primary (authoring + published)** | **[kujinlee/agent-skills-playground](https://github.com/kujinlee/agent-skills-playground)** | Local clone e.g. `~/code/claude-code-tutorial/agent-skills-playground`. Holds `snapshots/`, `docs/TUTORIAL.md`, root `src/` / `tests/` / `docs/`. See `snapshots/README.md` and `scripts/regenerate-snapshots.sh` in that repo. |
| **Source trees for `git archive`** | Clone of **[mattpocock/skills](https://github.com/mattpocock/skills)** | Historic path **`examples/skill-playground`** exists in that repo’s history — use it when regenerating snapshot folders. |

**Workflow:** edit and test in the **agent-skills-playground** clone → commit and push to **`origin`**. The canonical **pin table** and hybrid **03** recipe in this file should match the pins **agent-skills-playground** uses when snapshots are regenerated.

---

## Principles

1. **Teach before you refactor:** Day 1 + Day 2 **checklists and rubrics** exist **before** `priceOrder` / deep module boundaries.
2. **One pin when possible:** Prefer a **single** `git archive <commit>` snapshot; use a **hybrid** only where history cannot supply the state (step **03**).
3. **Do not mix post-refactor test edits into pre-refactor steps:** e.g. **`29dedf2`** touches **`tests/checkout.test.ts`** as well as Day 2 checklist — for ideal step **03**, take **checklist docs** from **`c4f50a7`**, not test hunks from **`29dedf2`**, unless you have verified they apply to pre-refactor code.

---

## Ideal step sequence

| Step | Slug | Learner outcome | Snapshot type |
|------|------|-----------------|----------------|
| **00** | `baseline` | Shallow checkout module; minimal tests | **Pin:** `7c7228d` |
| **01** | `product-and-design` | PRD, plan, brief, issue, RFC; `computeCheckout` + email exports appear | **Pin:** `1fdb32d` |
| **02** | `day1-characterization` | Characterization tests + types; Day 1 checklist started | **Pin:** `2f3779c` |
| **03** | `day1-day2-gates` | **Both** checklists + strict rubrics; **still no** `priceOrder` / Day 2 deep API | **Hybrid** (see below) |
| **04** | `day2-deep-boundaries` | `priceOrder`, receipts, quotes, completion, thin adapters | **Pin:** `e39ac3b` |
| **05** | `loyalty-and-regression` | Qualifying spend, loyalty, notifier/compat regression tests | **Pin:** `854cd78` |
| **06** | `review-and-organize` | Review doc, re-review fixes, docs under `docs/checkout-refactor/` | **Pin:** `2d124aa` |
| **07** | `migrate-shoehorn` | Shoehorn in tests | **Pin:** `4bb070f` |

**Dependency graph (same as teaching order):**

```text
00 → 01 → 02 → 03 → 04 → 05 → 06 → 07
```

---

## Building snapshots (automation-friendly)

**Regenerate all folders:** in the **agent-skills-playground** clone, run **`./scripts/regenerate-snapshots.sh`** (that script reads history from a **mattpocock/skills** clone — see the script’s comments).

`SOURCE` = **mattpocock/skills** clone root (repo that contains **`examples/skill-playground`** in git history). `TUTORIAL` = **agent-skills-playground** clone root.

### Steps 00–02, 04–07: single commit

```bash
export SOURCE=/path/to/mattpocock-skills-clone
export TUTORIAL=/path/to/agent-skills-playground
cd "$SOURCE"
git archive <COMMIT> examples/skill-playground | tar -x -C /tmp
mv /tmp/examples/skill-playground "$TUTORIAL/snapshots/NN-<slug>"
```

| Step | `COMMIT` |
|------|----------|
| 00 | `7c7228d` |
| 01 | `1fdb32d` |
| 02 | `2f3779c` |
| 04 | `e39ac3b` |
| 05 | `854cd78` |
| 06 | `2d124aa` |
| 07 | `4bb070f` |

### Step 03 — hybrid: “gates before refactor”

**Base (code + tests + non-checklist docs):** tree at **`2f3779c`** — **no** `priceOrder` / deep boundaries in `src/`.

**Overlay (checklists + rubrics only):** from **`c4f50a7`**, copy **only**:

- `examples/skill-playground/docs/CHECKLIST-day-1-checkout-refactor.md`
- `examples/skill-playground/docs/CHECKLIST-day-2-checkout-refactor.md`

**Procedure:**

```bash
export SOURCE=/path/to/mattpocock-skills-clone
export TUTORIAL=/path/to/agent-skills-playground
mkdir -p /tmp/snap-03
cd "$SOURCE"
git archive 2f3779c examples/skill-playground | tar -x -C /tmp/snap-03
git show c4f50a7:examples/skill-playground/docs/CHECKLIST-day-1-checkout-refactor.md \
  > /tmp/snap-03/examples/skill-playground/docs/CHECKLIST-day-1-checkout-refactor.md
git show c4f50a7:examples/skill-playground/docs/CHECKLIST-day-2-checkout-refactor.md \
  > /tmp/snap-03/examples/skill-playground/docs/CHECKLIST-day-2-checkout-refactor.md
mv /tmp/snap-03/examples/skill-playground "$TUTORIAL/snapshots/03-day1-day2-gates"
```

**Check:** `npm test` in the snapshot should pass (same expectation as **`2f3779c`**).

**Optional:** Replace **only** `CHECKLIST-day-2-checkout-refactor.md` with the version from **`29dedf2`** if you want tighter labels — **do not** apply **`29dedf2`**’s test file without review (it was authored **after** the deep refactor).

---

## Mapping: ideal steps ↔ actual git history

History order differs mainly here:

| Ideal step | Git reality |
|------------|-------------|
| **03** then **04** | On `main`, **`e39ac3b`** (04) comes **before** **`c4f50a7`** (checklist rubrics). The hybrid snapshot above restores **03 → 04**. |
| **05** | Matches **`92342b4`** then **`854cd78`**; pin **`854cd78`** includes both. |

Everything else aligns with **linear history** when using the pins in the table.

---

## What “done” looks like (step 07)

Same as `checkout-refactor-tutorial-steps.md`: full API, `docs/checkout-refactor/*` as in **`2d124aa`**, shoehorn in tests as in **`4bb070f`**.

---

## Layout (**agent-skills-playground**)

In the **[agent-skills-playground](https://github.com/kujinlee/agent-skills-playground)** repo (e.g. **`~/code/claude-code-tutorial/agent-skills-playground`**):

- `snapshots/00-baseline/` … `snapshots/07-migrate-shoehorn/` — one folder per step table above.
- `docs/` — tutorial and optional per-step notes (`docs/TUTORIAL.md`, etc.).

Pin **`00-baseline`** to **`7c7228d`**; build **`03-day1-day2-gates`** with the hybrid recipe, not a single commit.

**Publish:** commit and push from the **agent-skills-playground** clone:

```bash
cd ~/code/claude-code-tutorial/agent-skills-playground
git add -A && git status   # review
git commit -m "chore: refresh snapshots" && git push origin
```

Remote: **`git@github.com:kujinlee/agent-skills-playground.git`** (or HTTPS). Adjust the **local path** if your clone lives elsewhere.
