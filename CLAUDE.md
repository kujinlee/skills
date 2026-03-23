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

## Skill playground (`examples/skill-playground/`)

A deliberately broken TypeScript/Vitest project for practicing skills hands-on.

```bash
cd examples/skill-playground
npm install
npm test               # run all tests
npx vitest run <file>  # run a single test file
```

The playground has intentional problems: a shallow checkout module split across many files, a coupon discount bug, unsafe `as` type casts in tests, and a vague product brief — each one a target for a different skill.

## How skills are discovered

Claude Code scans directories for `SKILL.md` files. Descriptions are injected into the system prompt at session start. Full skill content loads only when a skill is triggered. No `.claude/` config or `CLAUDE.md` is required inside individual skill directories.
