---
scope: portable
---

# RedWave Labs EA Kit — Portable Core Rules

This is the **single source of truth** for ea-kit behavior. Read it before using a persona or workflow. Host adapters may explain how to load this file, but must not duplicate or override its policies.

Use the user's language where practical; Vietnamese is the default for RedWave trading work. Keep file paths, skill IDs, APIs, and code identifiers in English.

## Request routing

Classify before acting:

| Class | Mode | Route |
| --- | --- | --- |
| `trivial` | implement | One small, bounded change; tools may be used immediately. |
| `bugfix` | implement/review | Confirm repro and impact, then inspect and fix. |
| `analyze` | review | Read reports, journals, or code; do not invent a design document. |
| `strategy` | plan | Gather symbol, timeframe, risk, market regime, and an edge case; do not code before approval. |
| `feature` | plan/implement | Plan when multi-file or materially risky. |
| `orchestrate` | plan → implement → review | Plan and require explicit user approval before implementation. |
| `docs` | implement | Document only what the user requested. |
| `meta` | implement | Kit maintenance; do not apply trading discovery rituals. |

For a `strategy`, large `feature`, or `orchestrate` gate, ask **one P0 blocking question per turn**. Start with the unanswered decision that removes the largest implementation branch, wait for the reply, then reassess the next question from that answer. A multiple-choice format is allowed for that one decision; never bundle independent questions such as symbol, timeframe, risk, and market regime in the same message. Stop as soon as the remaining details are non-blocking or have a clearly disclosed default.

Use one conversation and switch persona/mode deliberately. A cross-persona boundary needs an approved PLAN with the same information or a `HANDOFF-*.md` file. Create `SESSION.md` only for orchestration, multi-day work, or two or more handoffs.

## Portable capabilities

Use capabilities, not vendor tool names: `read`, `edit`, `search`, `exec`, `web`, and `graph`. If a graph capability is absent or the project is not indexed, state that briefly and continue with file/text search. Never block a task solely because a host integration is unavailable.

## Skills

- Load at most two full core skill files for an active persona.
- Add an on-demand skill only when its trigger matches the task or error.
- Read one reference file at a time when an API detail is needed.
- Persona frontmatter is a capability catalog, not an instruction to eagerly load every listed skill.

Default core routing:

- MQL5: `mql5-clean-code`; add `rwcommon-library-patterns` only when RWCommon is required.
- cBot: `cbot-clean-code`; add migration or cTrader MCP guidance only when relevant.
- Tester: `strategy-tester-analysis` and `ea-debugging-patterns`.
- Strategist: `trading-requirements`; add brainstorming only for an unclear strategy.

## Trading policy

Determine `rwcommon` in this order:

1. Existing `Include/RWCommon/` or RWCommon includes → `required`.
2. Explicit project flag → follow it.
3. Greenfield/no library → `optional`.
4. User override → `required`, `optional`, or `forbidden`.

For MT5, `required` means trade/risk/trailing paths use RWCommon unless a documented library gap requires native code. For `optional` or `forbidden`, native APIs are permitted, but must validate volume, pip/point conversion, stops/freeze levels, and trade retcodes. cTrader uses `rwcommon=n/a`.

## Evidence before completion

Do not claim “done”, “fixed”, or “compiled/build OK” without evidence:

| Profile | Evidence |
| --- | --- |
| `mt5-code` | MT5 checklist plus compiler output, or explicit `VERIFY=MANUAL`. |
| `cbot-code` | cBot checklist plus build output, or explicit `VERIFY=MANUAL`. |
| `analyze-only` | Concrete findings and source report/log paths. |
| `docs-only` | Correct docs path and no invented strategy rules. |
| `kit-meta` | `npm test` passes in the current session. |

See `docs/architecture/VERIFY-PROFILES.md` for the detailed checklists.
