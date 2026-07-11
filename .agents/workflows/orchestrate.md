---
description: Coordinate multiple agents for full EA or cBot building lifecycle.
---

# /orchestrate - EA / cBot Agent Orchestration

You are now in **ORCHESTRATION MODE**. Coordinate specialized agents to solve this algorithmic trading task (MetaTrader 5 and/or cTrader).

## Task to Orchestrate

$ARGUMENTS

---

## 🔴 CRITICAL: Agents Requirement

> **ORCHESTRATION = MINIMUM 2 DIFFERENT AGENTS**
>
> **Validation before completion:**
> - Count invoked agents
> - If `agent_count < 2` → STOP and invoke more agents
> - Do not use `documentation-writer` unless the user explicitly asked for documentation

### Platform Detection (do this first)

| Signals in the task | Platform | Dev agent |
| ------------------- | -------- | --------- |
| `.mq5`, `.mqh`, MT5, MQL5, RWCommon, Strategy Tester | MetaTrader 5 | `mql5-expert` |
| cBot, cTrader, `cAlgo.API`, `.cs` robot | cTrader | `cbot-expert` |
| Both / migrate MT5 → cBot | Dual | `mql5-expert` then `cbot-expert` (or migration-focused path via `cbot-expert` + `mt5-to-cbot-migration`) |
| Unclear | **ASK** before Phase 2 | — |

### Agent Selection Matrix

| Task Type | REQUIRED Agents |
| --------- | --------------- |
| **New EA (MT5)** | `algo-strategist`, `mql5-expert`, `ea-tester` |
| **New cBot (cTrader)** | `algo-strategist`, `cbot-expert` |
| **New Indicator (MT5)** | `algo-strategist`, `mql5-expert` |
| **MT5 → cBot migration** | `algo-strategist` (scope), `cbot-expert`, optional `mql5-expert` for source clarification |
| **Fix Bug (MT5)** | `ea-tester`, `mql5-expert` |
| **Fix Bug (cBot)** | `cbot-expert`, optional `ea-tester` for log/report reasoning |
| **Docs only** | Do **not** use this workflow — route to `documentation-writer` |

---

## 🔴 STRICT 2-PHASE ORCHESTRATION

### PHASE 1: PLANNING (Sequential)

| Step | Agent | Action |
| ---- | ----- | ------ |
| 1 | `algo-strategist` | Create versioned plan under `docs/{version}/3-plans/PLAN-*.md` (read `docs/PROJECT_ROOT.md` for version) |

> 🔴 **NO OTHER AGENTS during planning!** Only `algo-strategist` applies.

### ⏸️ CHECKPOINT: User Approval

```
After PLAN.md is complete, ASK:

"✅ Plan created in docs. Do you approve? (Y/N)"
```

> 🔴 **DO NOT proceed to Phase 2 without explicit user approval!**

### PHASE 2: IMPLEMENTATION (Post-Approval)

| Group | MT5 path | cBot path |
| ----- | -------- | --------- |
| Logic & Dev | `mql5-expert` | `cbot-expert` |
| Verification | `ea-tester` | `ea-tester` (logic/edge-case review; cTrader reports if provided) |
| Docs (optional) | `documentation-writer` only if user asked | same |

> ✅ After user approval, route tasks sequentially to the selected agents.

## Available Agents

| Agent | Domain | Use when |
| ----- | ------ | -------- |
| `algo-strategist` | Planning | Brainstorm, logic, PRD, plan |
| `mql5-expert` | MT5 coding | MQL5 OOP, RWCommon, indicators |
| `cbot-expert` | cTrader coding | C# cBot, PipSize, cAlgo.API |
| `ea-tester` | Testing | Strategy Tester, journals, error codes, edge cases |
| `documentation-writer` | Docs | Explicit doc requests only |

---

## Orchestration Protocol

### Step 1: Analyze Task Domains

Identify ALL domains this task touches:

- Planning → `algo-strategist`
- MT5 coding → `mql5-expert`
- cTrader coding → `cbot-expert`
- Testing → `ea-tester`
- Documentation (explicit only) → `documentation-writer`

### Step 2: Phase Detection

| If Plan Exists | Action |
| -------------- | ------ |
| NO `PLAN-*.md` | → PHASE 1 (planning only) |
| YES `PLAN-*.md` + user approved | → PHASE 2 (implementation) |

### Step 3: Execute Based on Phase

**PHASE 1 (Planning):**  
Use `algo-strategist` to create `PLAN.md`. STOP and ASK user.

**PHASE 2 (Implementation):**  
- MT5: `mql5-expert` writes `.mq5` / `.mqh` (RWCommon patterns).  
- cBot: `cbot-expert` writes C# cBot (load `cbot-clean-code`, migration skill if porting).

**🔴 CRITICAL: Context Passing (MANDATORY)**  
When invoking ANY subagent, you MUST include:

1. **Original User Request:** Full text.
2. **Current Plan State:** Strategy rules and platform (MT5 / cTrader).
3. **Constraints:** Risk, symbol, timeframe, RWCommon or cAlgo constraints from the plan.

### Step 4: Verification (MANDATORY)

The last verification agent should check implementation against the plan and relevant clean-code skill:

- MT5 → `ea-tester` + `mql5-clean-code` / `ea-debugging-patterns`
- cBot → `cbot-clean-code` (and `ea-tester` when logs/reports exist)

### Step 5: Synthesize Results

Combine all agent outputs into a unified report.

---

## Output Format

```markdown
## 🎼 Orchestration Report

### Overview
[Summary of EA/cBot task + platform]

### Agents Invoked (MINIMUM 2)
| # | Agent | Focus Area | Status |
|---|-------|------------|--------|
| 1 | algo-strategist | Strategy logic | ✅ |
| 2 | mql5-expert or cbot-expert | Implementation | ✅ |
| 3 | ea-tester | Verification | ✅ / ⏭️ |

### Key Findings
1. **algo-strategist**: …
2. **dev agent**: …
3. **ea-tester**: …
```
