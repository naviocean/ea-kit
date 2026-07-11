# RedWave Labs EA Workflow Reference

This directory contains executable workflow commands for the EA Agent Kit. Use them as entry points so agents follow a consistent lifecycle: clarify → plan → implement → verify.

## Execution

Trigger a workflow by path or command prefix in your prompt.

Examples: `/plan XAUUSD session breakout` or `/test report reports/bt-xau.html`

---

## Phase 0: Ideation & Planning

_Do not write strategy code before requirements are clear._

| Command | Agent | Description | Example |
| ------- | ----- | ----------- | ------- |
| **`/brainstorm`** | `algo-strategist` | Structured strategy exploration: options, tradeoffs, drawdown vs PF, MQL5/cTrader constraints. | `/brainstorm mean reversion Asian session` |
| **`/plan`** | `algo-strategist` | Creates a versioned plan under `docs/{version}/3-plans/PLAN-*.md`. **No implementation code.** | `/plan trailing stop for grid EA` |

---

## Phase 1: Implementation & Coordination

| Command | Agents | Description | Example |
| ------- | ------ | ----------- | ------- |
| **`/orchestrate`** | Multi-agent | Coordinates specialists for a full EA/cBot lifecycle (plan → code → test). Minimum 2 agents. | `/orchestrate implement session breakout EA` |

Platform routing inside `/orchestrate`:

- **MetaTrader 5 (MQL5)** → `mql5-expert` + `ea-tester`
- **cTrader (C# cBot)** → `cbot-expert` (+ `ea-tester` for logic/report review when applicable)

Optional (only when the user explicitly asks for docs): `documentation-writer`.

---

## Phase 2: QA & Backtest Analysis

| Command | Agent | Description | Example |
| ------- | ----- | ----------- | ------- |
| **`/test`** | `ea-tester` | Analyze Strategy Tester reports/logs, MT5 error codes, edge cases (slippage, spread, gaps). | `/test report bt-2024.html`, `/test logs journal.log` |

---

## Available Agents

| Agent | Domain | Primary use |
| ----- | ------ | ----------- |
| `algo-strategist` | Strategy / PRD / risk | Requirements, rules, plans |
| `mql5-expert` | MQL5 / RWCommon | EA & indicator implementation |
| `cbot-expert` | cTrader C# | cBot implementation & MT5→cBot migration |
| `ea-tester` | Testing / logs | Backtest reports, journal bugs, review |
| `documentation-writer` | Docs only | README, PRD polish, ADRs, changelogs (explicit request only) |

---

## Gate Rules

Every workflow obeys the **Socratic Gate (Tier 0)** in `.agents/rules/GEMINI.md`. Vague requests are blocked with clarifying questions (symbol, timeframe, risk, scope) before coding.

Answer architectural questions clearly so the workflow can proceed.

---

## Extending Workflows

1. Add a Markdown file under `.agents/workflows/`.
2. Frontmatter MUST include `description: <brief explanation>`.
3. Document **Purpose**, **CRITICAL RULES**, and **execution steps**.
4. Reference only agents that exist under `.agents/agents/` and skills under `.agents/skills/`.
