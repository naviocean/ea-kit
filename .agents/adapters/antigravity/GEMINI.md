---
adapter: antigravity
---

# RedWave Labs EA Kit — Gemini / Antigravity Adapter

Source of truth: [`.agents/rules/EA-KIT.md`](.agents/rules/EA-KIT.md). Follow its routing, mode machine, and verification policies before acting.

## Core Rules Summary

1. **Request routing**: Classify prompt before acting (`trivial` | `bugfix` | `analyze` | `strategy` | `feature` | `orchestrate` | `docs` | `meta`).
2. **Socratic Gate**: For `strategy`, `feature`, or `orchestrate`, ask **one P0 blocking question per turn**; do not bundle independent questions.
3. **Evidence before claims**: Do not claim “done” or “fixed” without compiler/build/test evidence per verify profile (`mt5-code`, `cbot-code`, `analyze-only`, `docs-only`, `kit-meta`).
4. **Trading policy**: Use `rwcommon` based on project context (`required` if `Include/RWCommon` present; `optional` for greenfield).
5. **Portable capabilities**: Use `read`, `edit`, `search`, `exec`, `web`, `graph`.
