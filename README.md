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

## Core Framework: RWCommon Pattern

This kit enforces the **RWCommon Library** architecture for MT5 EAs. Agents structure logic and route orders through standard wrappers (`RiskManager`, `TradeExecutor`, `TrailingManager`, etc.) for reliable error handling (e.g. 10016), and consistent pip/point scaling. Native MT5 `OrderSend` is restricted unless RWCommon cannot support the case.

cTrader work uses `cbot-clean-code`, `mt5-to-cbot-migration`, and related skills — not MQL5 syntax.

## Agents

| Agent | Role |
| ----- | ---- |
| `algo-strategist` | Strategy, risk, PRDs, plans (no platform code) |
| `mql5-expert` | MQL5 EA/indicator implementation (RWCommon) |
| `cbot-expert` | cTrader C# cBot implementation |
| `ea-tester` | Strategy Tester reports, journals, edge cases |
| `documentation-writer` | README / ADR / docs only when explicitly requested |

## Features

- **Socratic Gate (Tier 0):** Clarifies symbol, timeframe, risk, and logic gaps before strategy code.
- **Intelligent routing (Tier 1):** Routes strategy → strategist, MQL5 → `mql5-expert`, cBot → `cbot-expert`, logs/backtests → `ea-tester`.
- **Lazy-loading skills:** Loads modules such as `mql5-clean-code`, `rwcommon-library-patterns`, `ea-debugging-patterns`, `cbot-clean-code` only when needed.
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
docs/           # Kit-level docs pointer (PROJECT_ROOT.md)
others/         # Legacy / non-shipped scratch (not part of package install)
```

`package.json` ships only `.agents` and `bin` when installed via npm/npx.

---

**Note:** This repository follows RedWave Labs EA **`documentation-standards`**. Workflow and agent files must reference only personas and skills that exist under `.agents/`.
