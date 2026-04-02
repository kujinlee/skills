# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A collection of Claude Code skills — reusable agent behaviors distributed via `npx skills@latest add mattpocock/skills/<name>`. Each skill is a directory containing a `SKILL.md` and optional supporting files.

## Skill structure

```
skill-name/
├── SKILL.md       # Required. Frontmatter + instructions.
├── REFERENCE.md   # Long-form docs (when SKILL.md would exceed ~100 lines)
├── EXAMPLES.md    # Usage examples (optional)
└── scripts/       # Deterministic utility scripts (optional)
```

**`SKILL.md` frontmatter** (required fields):
```yaml
---
name: skill-name
description: What it does. Use when [specific triggers].
---
```

The `description` field is the only thing Claude sees when deciding which skill to invoke — it must include "Use when..." with concrete trigger keywords. Max 1024 chars.

## Skill authoring rules

- Keep `SKILL.md` under 100 lines; split into `REFERENCE.md` / `EXAMPLES.md` when it grows.
- No time-sensitive information in skill content.
- Add `scripts/` only for deterministic, repeatedly-generated operations.
- The `description` drives auto-invocation: vague descriptions cause skills to be missed or misrouted.

## Skill playground (separate repo)

Hands-on practice (TypeScript/Vitest checkout tutorial, frozen snapshots, walkthrough) lives in **[kujinlee/agent-skills-playground](https://github.com/kujinlee/agent-skills-playground)** — not in this repository.

```bash
git clone https://github.com/kujinlee/agent-skills-playground.git
cd agent-skills-playground
npm install
npm test
```

Follow **`docs/TUTORIAL.md`** in that repo. The project is deliberately imperfect (shallow checkout module, coupon bug, unsafe `as` in tests, vague brief) so different skills have clear targets.

To pull historical `examples/skill-playground` trees from git (e.g. for snapshot regeneration), use a clone of **[mattpocock/skills](https://github.com/mattpocock/skills)** and `git archive <commit> examples/skill-playground`.

## How skills are discovered

Claude Code scans directories for `SKILL.md` files. Descriptions are injected into the system prompt at session start. Full skill content loads only when a skill is triggered. No `.claude/` config or `CLAUDE.md` is required inside individual skill directories.
