---
description: Create project plan using algo-strategist agent. Explores strategy rules and creates a plan file.
---

# /plan - Systematic Trading Planning Mode

$ARGUMENTS

---

## Purpose

This command initiates the planning phase for a new EA or Indicator using the `algo-strategist` agent to ensure requirements are clear before any code is written.

---

## 🔴 CRITICAL RULES

1. **NO CODE WRITING** - This command creates a plan file ONLY. Do not write implementation code.
2. **Agent Selection** - Switch to the `algo-strategist` agent to handle this request.
3. **Socratic Gate (Tier 0)** - ALWAYS ask clarifying questions before generating the plan.
4. **Relevant Skills** - Apply `brainstorming`, `plan-writing`, and `documentation-standards` skills.

---

## Task Execution

### Phase 1: Clarification (Socratic Gate)

- Review the `$ARGUMENTS` (User Request).
- Ask minimum 2-3 strategic questions regarding Purpose, Target Symbol, Timeframe, or Risk parameters.
- Wait for user confirmation before proceeding.

### Phase 2: Folder Structure

- Read `docs/PROJECT_ROOT.md` to identify the current active project version (e.g., `v1.0`). If the file doesn't exist, assume `v1.0`.
- Ensure the destination directory exists (e.g., `docs/v1.0/3-plans/`). NEVER put plan files in the repository root or flat `docs/` folder.

### Phase 3: Plan Generation

- Once requirements are clear, generate a structured plan document.
- **Output Location**: `docs/{version}/3-plans/PLAN-{task-slug}.md`

### Phase 4: Content of the Plan

The plan MUST include:

1. **Trading Objective**: Summary of what needs to be built (EA vs Indicator, Scalper vs Swing).
2. **Strategy Rules**: Exact entry conditions, exit conditions, filters.
3. **Architecture**: Which RWCommon modules are needed (e.g., CycleManager, RiskManager).
4. **Task Breakdown**: Step-by-step implementation plan.
5. **Agent Assignments**: Which agents (`mql5-expert`, `ea-tester`) will handle which tasks.

---

## Completion

Inform the user:

```
[OK] Plan created: docs/{version}/3-plans/PLAN-{slug}.md

Next steps:
- Review the plan.
- If approved, we can begin implementation using `/orchestrate`.
```
