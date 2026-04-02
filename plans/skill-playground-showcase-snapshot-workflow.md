# Skill-playground showcase — snapshot-folder workflow (Plan B)

> **Repository layout:** This **skills** clone no longer contains `examples/`. The snapshot-folder tutorial now lives in **[kujinlee/agent-skills-playground](https://github.com/kujinlee/agent-skills-playground)**. Use **[mattpocock/skills](https://github.com/mattpocock/skills)** + `git archive … examples/skill-playground` for historic source trees.

Local workflow notes for building a **separate** showcase repo using **snapshot folders** only.  
Not intended as upstream README content; keep out of GitHub if you prefer (add this path to `.gitignore` in your clone).

**Bootstrapped tree:** **[kujinlee/agent-skills-playground](https://github.com/kujinlee/agent-skills-playground)** — checkout-refactor snapshots **00–07**, regenerate via `scripts/regenerate-snapshots.sh` in that repo. Workflow: [`checkout-refactor-ideal-teaching-order.md`](checkout-refactor-ideal-teaching-order.md).

---

## What “snapshot folders” means

- **`snapshots/NN-name/`** holds a **frozen copy** of the project at that step (at minimum `src/`; include `tests/` and `docs/` when they change).
- **Root `src/`**, **`tests/`**, **`docs/`** (optional) are the **working tree** — always “latest completed step” while you build the showcase.
- Readers compare folders: `snapshots/00-baseline` → `snapshots/01-…` → … → last snapshot, or diff two paths.

---

## Directory contract (new showcase repo)

```text
README.md
package.json, tsconfig, vitest config, etc.
src/                    # current state (last finished step)
tests/
docs/                   # PRODUCT_BRIEF, etc., as needed
snapshots/
  00-baseline/          # immutable: original teaching code
    src/
    tests/
    docs/               # optional copy if brief is part of story
  01-<slug>/
    src/
    tests/
    ...
  02-<slug>/
    ...
docs/
  showcase/
    00-baseline.md      # what’s wrong on purpose + skill map
    01-<slug>.md        # per-step narrative
    ...
  artifacts/            # PRD, triage, plans, issues (exports)
    01-write-a-prd.md
    ...
```

**Naming:** `NN` is zero-padded two digits; `<slug>` is short (`shoehorn`, `triage-coupon`, `prd-loyalty`). Same slug in `snapshots/` and `docs/showcase/`.

---

## Workflow: bootstrap (empty → baseline)

1. Create repo; add `package.json`, tooling, `npm test` green on empty or stub.
2. Copy **teaching baseline** from source (e.g. **`examples/skill-playground`** in a **[mattpocock/skills](https://github.com/mattpocock/skills)** checkout, or an existing **`snapshots/00-baseline/`** in **agent-skills-playground**) into **root** `src/`, `tests/`, `docs/` as needed.
3. Run `npm install && npm test`; fix only **import paths / config** so tests match your layout.
4. **Freeze baseline:** recursively copy root `src/`, `tests/`, `docs/` (only what exists) into `snapshots/00-baseline/`.
5. Write `docs/showcase/00-baseline.md`: intentional problems, table **problem → skill(s) → suggested prompt**.
6. Commit (in showcase repo): `chore: add snapshot 00-baseline` — optional tag `snapshot/00-baseline`.

**Rule:** After step 4, **do not edit** `snapshots/00-baseline/` except to fix mistakes in the same PR; treat it as immutable history.

---

## Workflow: each skill step (repeat)

For step **N** with slug **`<slug>`**:

1. **Work only in root** `src/`, `tests/`, `docs/` — implement or document the change for this skill (tests should pass unless you deliberately document a red step).
2. **Snapshot:** copy the same directories into `snapshots/NN-<slug>/` so it mirrors root for that step.
3. **Narrative:** add `docs/showcase/NN-<slug>.md`:
   - Skill name (and fork if relevant)
   - Exact **prompt** you used (or paraphrase + paste)
   - **Files touched** (paths)
   - **Commands:** `npm test` (and `npm run lint` if any)
   - **Artifact link:** path under `docs/artifacts/` if this step produced a doc
4. **Artifacts:** if the skill outputs PRD / plan / issues / triage body, save under `docs/artifacts/NN-<artifact>.md` and link from the step doc.
5. Commit (showcase repo): `feat(showcase): step NN <slug>` — optional git tag `snapshot/NN-<slug>`.

**Order:** complete steps **sequentially** so each `NN` is strictly after `NN-1`; avoid rewriting old snapshots.

---

## Avoiding drift

- **Single source of truth while building:** root tree is live; snapshots are **copies at commit time**.
- After copying to `snapshots/NN-<slug>/`, do **not** edit that folder for the *next* step — only edit root, then copy again for `NN+1`.
- Optional **sanity script** (run locally): assert that listed files exist under `snapshots/NN-<slug>/` and that `npm test` passes from repo root (not from inside snapshot).

---

## What to duplicate per snapshot

| Include | When |
|--------|------|
| `src/` | Always |
| `tests/` | Always if tests exist |
| `docs/` | When brief or docs change in that step |
| `package.json` | Only if deps/scripts change (usually **once** at start or rare; otherwise document in root README only) |

**Avoid** copying `node_modules/` into snapshots.

---

## Reader experience (README bullets for the showcase repo)

- “Open `snapshots/00-baseline/src` … then `snapshots/01-…/src` …”
- “Diff two folders: `diff -ru snapshots/00-baseline/src snapshots/03-foo/src`”
- “Read `docs/showcase/` in order.”

---

## When you’re done

- Ensure **last snapshot** matches **root** `src/`/`tests/` (or document if root is ahead).
- Final README: table of steps with links to `docs/showcase/NN-*.md`.
- Optional: CI runs `npm test` on `main` only (root), not inside each snapshot.

---

## Out of scope for this document

- Choosing which skills or ordering (curriculum) — only folder workflow and process here.
- Git branching strategy — Plan B uses folders; tags are optional sugar.
