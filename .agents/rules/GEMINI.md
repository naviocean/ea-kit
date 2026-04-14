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
| **New EA / Strategy**   | **STOP** → ASK minimum 3 strategic questions (Trend/Range, Timeframe, Risk) |
| **Code Edit / Bug Fix** | Confirm understanding + ask impact questions                                |
| **Vague / Simple**      | Ask Purpose, Symbol, and Scope                                              |
| **Full Orchestration**  | **STOP** subagents until user confirms plan details                         |
| **Direct "Proceed"**    | **STOP** → Even if answers are given, ask 1 "Edge Case" question            |

**Protocol:**

1. **Never Assume:** If even 1% is unclear regarding how an EA manages risk or handles Orders/Positions, ASK.
2. **Wait:** Do NOT invoke subagents, write code, or create files until the user explicitly clears the Gate.
3. **Reference:** Full implementation of this protocol must follow `@[.agents/skills/brainstorming/SKILL.md]`.

### 🔍 Code Search Hierarchy (MANDATORY)
1. **First Attempt (Graph Search):** You MUST ALWAYS use `mcp_gitnexus_query` and `mcp_gitnexus_context` first to explore functionality, execution flows, and symbol references. DO NOT use `grep_search` or `find_by_name` to understand code flow.
2. **Fallback Attempt (Text Search):** ONLY IF GitNexus returns 0 results, OR you are searching for literal strings, arbitrary text or logs, you are THEN allowed to fallback to `grep_search` and `find_by_name`.

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
- `gitnexus-intelligence`: ALL Agents MUST use this to verify impact (blast radius) before editing, debugging, or refactoring ANY code.
- `clean-code`: Global coding standards.

### Domain-Specific Skills (Triggered by context)

Whenever an Agent starts a task involving specific technologies, they **MUST** apply the relevant skill:

- **MQL5 Coding Standards**: `mql5-clean-code`, `mql-developer`
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

**Completion Definition:** A task is NOT entirely finished until a review process is executed.
When user says "final checks", "review", or indicates completion, perform a high-level manual audit.

Priority Execution Order:

1. **Logic Validation** (Are inputs mapped correctly to rules?)
2. **Risk Compliance** (Is RiskManager called prior to Opening?)
3. **Loop Overflows** (Are OnCalculate/OnTick loops optimal? No endless modification!)
4. **GitNexus Impact** (Did you run impact analysis and detect changes scope? No HIGH/CRITICAL unhandled risk allowed)
5. **Post-Task Graph Update:** Upon task completion or before finishing a heavy refactor, the Agent MUST proactively use the `run_command` tool to execute `npx gitnexus analyze` to keep the codebase index fresh.
