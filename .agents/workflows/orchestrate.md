---
description: Coordinate multiple agents for full EA building lifecycle.
---

# /orchestrate - EA Agent Orchestration

You are now in **ORCHESTRATION MODE**. Your task: coordinate specialized agents to solve this complex MQL5 problem.

## Task to Orchestrate

$ARGUMENTS

---

## 🔴 CRITICAL: Agents Requirement

> **ORCHESTRATION = MINIMUM 2 DIFFERENT AGENTS (algo-strategist + mql5-expert)**
>
> **Validation before completion:**
> - Count invoked agents
> - If `agent_count < 2` → STOP and invoke more agents

### Agent Selection Matrix

| Task Type      | REQUIRED Agents |
| -------------- | ----------------|
| **New EA**     | algo-strategist, mql5-expert, ea-tester |
| **New Indicator**| algo-strategist, mql5-expert |
| **Fix Bug**    | ea-tester, mql5-expert |

---

## 🔴 STRICT 2-PHASE ORCHESTRATION

### PHASE 1: PLANNING (Sequential)

| Step | Agent             | Action                       |
| ---- | ----------------- | ---------------------------- |
| 1    | `algo-strategist` | Create versioned `PLAN.md`   |

> 🔴 **NO OTHER AGENTS during planning!** Only algo-strategist applies.

### ⏸️ CHECKPOINT: User Approval

```
After PLAN.md is complete, ASK:

"✅ Plan created in docs. Do you approve? (Y/N)"
```

> 🔴 **DO NOT proceed to Phase 2 without explicit user approval!**

### PHASE 2: IMPLEMENTATION (Post-Approval)

| Group | Agents |
| -------------- | ------------------------------------------- |
| Logic & Dev    | `mql5-expert` |
| Verification   | `ea-tester` |

> ✅ After user approval, route tasks sequentially to these agents.

## Available Agents (3 total)

| Agent                 | Domain   | Use When                |
| --------------------- | -------- | ----------------------- |
| `algo-strategist`     | Planning | Brainstorm, Logic, PRD  |
| `mql5-expert`         | Coding   | MQL5 OOP, CTrade, Array |
| `ea-tester`           | Testing  | Strategy Tester, Bugs   |

---

## Orchestration Protocol

### Step 1: Analyze Task Domains

Identify ALL domains this task touches:
- Planning → algo-strategist
- Coding → mql5-expert
- Testing → ea-tester

### Step 2: Phase Detection

| If Plan Exists                                         | Action                           |
| ------------------------------------------------------ | -------------------------------- |
| NO `PLAN-*.md`                                         | → Go to PHASE 1 (planning only)  |
| YES `PLAN-*.md` + user approved                        | → Go to PHASE 2 (implementation) |

### Step 3: Execute Based on Phase

**PHASE 1 (Planning):**
Use `algo-strategist` to create PLAN.md. STOP and ASK user.

**PHASE 2 (Implementation):**
Use `mql5-expert` to write `.mq5` code.

**🔴 CRITICAL: Context Passing (MANDATORY)**
When invoking ANY subagent, you MUST include:
1. **Original User Request:** Full text.
2. **Current Plan State:** The strategy rules.

### Step 4: Verification (MANDATORY)
The LAST agent (`ea-tester`) must read the code output or logic and check against `mql5-clean-code`.

### Step 5: Synthesize Results
Combine all agent outputs into unified report.

---

## Output Format

```markdown
## 🎼 Orchestration Report

### Overview
[Summary of EA task]

### Agents Invoked (MINIMUM 2)
| # | Agent | Focus Area | Status |
|---|-------|------------|--------|
| 1 | algo-strategist | Strategy logic | ✅ |
| 2 | mql5-expert | MQL5 Code | ✅ |

### Key Findings
1. **algo-strategist**: RSI + Moving Average logic.
2. **mql5-expert**: CTrade module utilized for entries.
```
