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
2. Append `.agents/rules/GEMINI.md` to the AI system prompt / always-on rules.
3. Enable MCP from `.agents/mcp_config.json` when using GitNexus (optional but recommended for large codebases).
4. Drive work with workflows: `/brainstorm`, `/plan`, `/orchestrate`, `/test`.

## Agent harness (control plane)

Always-on rules: **`.agents/rules/GEMINI.md`** (tiếng Việt) — classify request → gate depth → mode → persona → verify.

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
- **Workflows:** `/brainstorm`, `/plan`, `/orchestrate`, `/test` — see `.agents/workflows/README.md`.
- **Docs layout:** Versioned `docs/{version}/…` per `documentation-standards`.

## Repository layout

```text
.agents/
  agents/       # Personas
  skills/       # Lazy-loaded expertise
  workflows/    # /brainstorm, /plan, /orchestrate, /test
  rules/        # Global always-on rules (GEMINI.md)
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

---

**Note:** This repository follows RedWave Labs EA **`documentation-standards`**. Workflow and agent files must reference only personas and skills that exist under `.agents/`.
