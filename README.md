# RedWave Labs EA Agent Kit

Standard AI Agent kit for RedWave Labs internal algorithmic trading projects — optimized for **MetaTrader 5 (MQL5)** and **cTrader (C# cBot)** workflows, with the **RWCommon** library as the default execution/risk stack on MT5.

## Quick Start

### Option A — CLI (recommended)

Package and binary name: **`ea-kit`** (repo: `github.com/naviocean/ea-kit`).

From the target project root:

```bash
# Install .agents into the current project
npx ea-kit init

npx ea-kit status
npx ea-kit update   # backs up then overwrites .agents — confirm first
npx ea-kit doctor   # inspect Node, installed rules, adapters, and platform hints
npx ea-kit link-host codex
```

Local dev (this repo):

```bash
npm link          # exposes `ea-kit` on PATH
ea-kit init -p /path/to/your-ea-project
```

Useful flags: `-p <dir>`, `-f` / `--force`, `-q` / `--quiet`, `--dry-run`.

After install, the project gets `.agents/ea-kit-version.json` (name + version + install time).

### Option B — Manual copy

1. Copy the entire `.agents` folder into the root of your EA/cBot project.
2. Load `.agents/rules/EA-KIT.md` as the AI project rule / always-on instruction. For automatic root-rule discovery, copy `.agents/adapters/codex/AGENTS.md` to `AGENTS.md` (Codex) or `.agents/adapters/claude/CLAUDE.md` to `CLAUDE.md` (Claude Code); see `.agents/adapters/README.md` for Cursor, Gemini, and generic hosts.
3. Optionally enable the **pinned** GitNexus MCP configuration from `.agents/mcp_config.json` for large codebases.
4. Drive work with workflows: `/brainstorm`, `/plan`, `/orchestrate`, `/test`.

## Agent harness (control plane)

Portable core rules: **`.agents/rules/EA-KIT.md`** (tiếng Việt) — classify request → gate depth → mode → persona → verify. `GEMINI.md` is a compatibility adapter only.

| Doc | Purpose |
| --- | ------- |
| [DESIGN-agent-harness.md](docs/architecture/DESIGN-agent-harness.md) | Full harness design |
| [ADR-003-agent-harness.md](docs/architecture/ADR-003-agent-harness.md) | Decision record |
| [VERIFY-PROFILES.md](docs/architecture/VERIFY-PROFILES.md) | Iron Law checklists (MT5 / cBot / analyze) |
| `docs/v1.0/4-tasks/HANDOFF.template.md` | Cross-persona handoff |
| `docs/v1.0/4-tasks/SESSION.template.md` | Session map (orchestrate / multi-day) |

**Request classes:** `trivial` · `bugfix` · `analyze` · `strategy` · `feature` · `orchestrate` · `docs` · `meta`  
**Modes:** `intake` → `plan` | `implement` | `review` → `done`

## RWCommon (flexible)

If the project already uses `Include/RWCommon` (or a project flag), agents treat RWCommon as **required** for trade/risk paths.  
Greenfield / no lib → **optional** (native allowed with notes); still enforce retcodes, stops, pip/point.  
User override always wins.

cTrader uses `cbot-clean-code` / migration skills — not MQL5/RWCommon.

## Agents

| Agent | Role |
| ----- | ---- |
| `algo-strategist` | Strategy, risk, PRDs, plans (no platform code) |
| `mql5-expert` | MQL5 EA/indicator implementation |
| `cbot-expert` | cTrader C# cBot implementation |
| `ea-tester` | Strategy Tester reports, journals, edge cases |
| `documentation-writer` | README / ADR / docs only when explicitly requested |

## Features

- **Class-based gates:** Full Socratic only for strategy/orchestrate — not every one-line fix.
- **Modes + HANDOFF:** Multi-role via durable files (not fake multi-process agents).
- **Skill tiers:** Core (≤2) + on-demand + single reference file.
- **Domain skills:** `trading-requirements`, `prop-firm-constraints`, `strategy-tester-analysis` (strategist/tester).
- **Workflows:** `/brainstorm`, `/plan`, `/orchestrate`, `/test` — see `.agents/workflows/README.md`.
- **Docs layout:** Versioned `docs/{version}/…` per `documentation-standards`.

## Repository layout

```text
.agents/
  agents/       # Personas
  skills/       # Lazy-loaded expertise
  workflows/    # /brainstorm, /plan, /orchestrate, /test
  rules/        # Portable core rules + compatibility adapters
  adapters/     # Host setup snippets (Codex, Claude, Cursor, Gemini)
  mcp_config.json
bin/            # CLI (init / update / status)
scripts/        # Kit self-test (npm test)
docs/           # Kit-level docs pointer (PROJECT_ROOT.md)
others/         # Legacy / non-shipped — see others/README.md
```

`package.json` ships `.agents`, `bin`, and `scripts` when installed via npm/npx. The `others/` folder is **legacy scratch and is not shipped**.

## Kit self-test

From this repository:

```bash
npm test
# same as: node scripts/verify-kit.mjs
```

Checks: expected agents/workflows, agent → skill paths, no monorepo/web ghost agents, package name `ea-kit`.

`npm test` also runs routing contract fixtures from `.agents/fixtures/harness/`. They validate the kit's expected class → mode → persona → verify-profile routes; they are deterministic harness contracts, not a claim to grade LLM reasoning quality.

## Setup diagnostics

`ea-kit doctor [-p <project>]` is read-only. It reports the Node version, kit installation, portable core rule, manifest, recognized host adapters, platform source hints, and RWCommon detection. Add `--strict` in CI when the kit and core rule must be present.

`ea-kit link-host <codex|claude|cursor|gemini|antigravity>` copies one adapter from the installed kit. It refuses to overwrite an existing host file unless `--force` is explicit; use `--dry-run` to preview.

---

**Note:** This repository follows RedWave Labs EA **`documentation-standards`**. Workflow and agent files must reference only personas and skills that exist under `.agents/`.
