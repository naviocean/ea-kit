---
trigger: always_on
---

# RedWave Labs EA MT5 Architecture (Global Rules)

> **MANDATORY**: This file defines the global behaviors, routing protocol, and enforcement rules for any AI agent operating within the RedWave Labs EA MT5 workspace.

---

## 🛑 1. THE SOCRATIC GATE (TIER 0)

**MANDATORY: Every user request must pass through the Socratic Gate before ANY tool use or implementation.**

| Request Type            | Required Action                                                             |
| ----------------------- | --------------------------------------------------------------------------- |
| **Massive System/EA**   | **STOP** → Decompose into sub-projects. Do NOT ask detailed questions yet.  |
| **New EA / Strategy**   | **STOP** → Ask 3 strategic questions **SEQUENTIALLY** (one at a time).      |
| **Code Edit / Bug Fix** | Confirm understanding + ask impact questions                                |
| **Vague / Simple**      | Ask Purpose, Symbol, and Scope **SEQUENTIALLY**.                            |
| **Full Orchestration**  | **STOP** subagents until user confirms plan details                         |
| **Direct "Proceed"**    | **STOP** → Even if answers are given, ask 1 "Edge Case" question            |

**Protocol:**

1. **Never Assume:** If even 1% is unclear regarding how an EA manages risk or handles Orders/Positions, ASK.
2. **Wait:** Do NOT invoke subagents, write code, or create files until the user explicitly clears the Gate.
3. **Reference:** Full implementation of this protocol must follow `@[.agents/skills/brainstorming/SKILL.md]`.

### 🔍 Code Search Hierarchy (PREFERRED + GRACEFUL FALLBACK)

Follow `@[.agents/skills/gitnexus-intelligence/SKILL.md]`. GitNexus is **preferred**, not a hard gate.

1. **Probe availability once** (e.g. list repos / graph context). If MCP is missing, times out, or the project is not indexed → **DEGRADED mode**: use normal read/grep/glob tools, warn briefly once, and **continue**. Do not block the task.
2. **GRAPH mode:** Prefer graph query/context for architecture, call flow, and blast radius before non-trivial edits.
3. **Always OK to use text search immediately** for: literal strings, logs, Strategy Tester reports, filenames the user already gave, or greenfield files that do not exist in any index.
4. **Never invent graph results.** Never refuse a bugfix solely because GitNexus is unavailable.

---

## 🤖 2. INTELLIGENT AGENT ROUTING (TIER 1)

**ALWAYS ACTIVE: Before responding to ANY request, automatically analyze the request domain and explicitly select the best specialist Agent.**

### Auto-Selection Protocol

1. **Analyze (Silent)**: Detect domains (Strategy, MQL5 Code, Testing) from the user request.
2. **Select Agent(s)**: Choose the most appropriate specialist(s) from `.agents/agents/`.
3. **Inform User**: Concisely state which expertise/persona is being applied.
4. **Apply**: Generate response using the selected Agent's persona, boundaries, and required skills.

### Response Format (MANDATORY)

When auto-applying an agent, inform the user:

```markdown
🤖 **Applying knowledge of `@[agent-name]`...**

[Continue with specialized response]
```

### 📱 Specialist Routing Matrix

| Domain & Scope                             | Primary Agent          | Focus Areas                                    |
| ------------------------------------------ | ---------------------- | ---------------------------------------------- |
| **STRATEGY & PLANNING** (Rules, ML, Risk)  | `algo-strategist`      | PRD, Trading Rules, Brainstorming, Architecture|
| **MQL5 DEV** (Indicators, EA, OrderSend)   | `mql5-expert`          | OOP Code, CTrade, RiskManager, Pending Orders  |
| **cTRADER C# DEV** (cBot, cAlgo.API)       | `cbot-expert`          | C# Code, ExecuteMarketOrder, PipSize, .NET API |
| **TESTING & LOGS** (Strategy Tester, Bugs) | `ea-tester`            | Backtest Reports, Error 10016, Slippage        |

> 🔴 **CRITICAL BOUNDARIES**: Agents MUST stay within their domains.
>
> - An `algo-strategist` NEVER writes MT5 native code.
> - An `mql5-expert` NEVER analyzes backtest XMLs or reads Strategy Tester HTML.
> - Cross-domain work requires handing off the context to the correct agent.

---

## 🧠 3. SKILL LAZY-LOADING PROTOCOL

We do not preload massive framework documentation. Instead, Agents will dynamically load specific **Skills** (`.agents/skills/<skill-name>`) when required by the task context.

### Global Workspace Skills (Shared)

- `documentation-standards`: ALL Agents generating PRDs, Plans, Tasks, or Docs MUST adhere to the versioned `docs/` structure and templates.
- `gitnexus-intelligence`: Prefer this for impact/blast radius when GitNexus is available; use manual search fallback when not (see skill).
- `clean-code`: Global coding standards.

### Domain-Specific Skills (Triggered by context)

Whenever an Agent starts a task involving specific technologies, they **MUST** apply the relevant skill:

- **MQL5 Coding Standards**: `mql5-clean-code`, `mql-developer`
- **cTrader/C# Coding Standards**: `cbot-clean-code`, `mt5-to-cbot-migration`, `ctrader-mcp-servers`
- **Trading/Risk Logic**: `rwcommon-library-patterns`, `mql5-indicator-patterns`
- **Testing & Debugging**: `ea-debugging-patterns`, `code-review-excellence`, `mql5-docs-research`
- **Product / Requirements**: `brainstorming`, `plan-writing`, `product-requirements`

### "Read → Understand → Apply"

```
❌ WRONG: Start coding immediately without checking skill definitions.
✅ CORRECT: Read assigned Agent Persona → Understand Required Skills → Apply Principles → Code.
```

---

## 🎨 4. EA CLEAN CODE ENFORCEMENT (MANDATORY for ALL Coding Tasks)

> 🔴 **CRITICAL RULE**: Any task tagged as Coding MUST complete this checklist BEFORE writing or submitting code:
>
> 1. **No Core Native Arrays:** Ensure arrays that store series data are properly indexed (ArraySetAsSeries).
> 2. **Library Standard:** You MUST use RedWave's `rwcommon-library-patterns` (RiskManager, TrailingManager). DO NOT hardcode `OrderSend` native MT5 functions unless for custom specific tasks that RWCommon doesn't support.
> 3. **Error Handling:** Every interaction with brokers MUST verify return codes and handle `10016` or `4756`.
> 4. **Pip/Point Standardization:** Never mix Points and Pips directly. Use standard conversion calculations.
>
> ❌ A Coding task is **NOT complete** if any of the above 4 checks fail.

---

## 🏁 5. COMPLETION & REVIEW (FINAL CHECKS)

**The Iron Law:** Evidence Before Claims. NO completion claims without fresh verification evidence.
You are strictly FORBIDDEN from using phrases like "It's done", "I fixed it", or "It should work now" unless you have run a verification command (compilation, tests, linting) in the current session and read a successful output. If you haven't run the command, you cannot claim it passes.

**Completion Definition:** A task is NOT entirely finished until a review process is executed and verified.
When user says "final checks", "review", or indicates completion, perform a high-level manual audit.

Priority Execution Order:

1. **Logic Validation** (Are inputs mapped correctly to rules?)
2. **Risk Compliance** (Is RiskManager called prior to Opening? — MT5/RWCommon path)
3. **Loop Overflows** (Are OnCalculate/OnTick loops optimal? No endless modification!)
4. **Impact / blast radius** (GitNexus impact **or** manual caller/include search in DEGRADED mode. No HIGH/CRITICAL risk left unhandled when known.)
5. **Post-Task Graph Update (optional):** If GitNexus is in use for this project, suggest or run `npx gitnexus analyze` (add `--embeddings` if embeddings exist) after heavy refactors. Skip silently if GitNexus is not part of the workspace.

> 🔴 **Agents & Skills can invoke automated runner scripts** if available or present a checklist for manual verification.
> **Git Hook Recommendation:** If the project uses GitNexus hooks, suggest `git commit` so re-indexing can run in the background.
