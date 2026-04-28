---
name: brainstorming
description: Socratic questioning protocol + user communication. MANDATORY for complex requests, new features, or unclear requirements. Includes progress reporting and error handling.
allowed-tools: Read, Glob, Grep
---

# Brainstorming & Communication Protocol

> **MANDATORY:** Use for complex/vague requests, new features, updates.

---

## 🛑 SOCRATIC GATE (ENFORCEMENT)

### When to Trigger

| Pattern                                     | Action                             |
| ------------------------------------------- | ---------------------------------- |
| "Build/Create/Make [thing]" without details | 🛑 ASK 3 questions                 |
| Complex feature or architecture             | 🛑 Clarify before implementing     |
| Update/change request                       | 🛑 Confirm scope                   |
| Vague requirements                          | 🛑 Ask purpose, users, constraints |

### 🚫 MANDATORY: The Process

1. **Decomposition Check:** If the request describes a massive system (e.g., "build an entire EA grid system from scratch"), flag it immediately and decompose into smaller, independent sub-projects before asking detailed questions.
2. **STOP** - Do NOT start coding.
3. **ASK** - Minimum 3 questions (Purpose, Users, Scope).
   - 🎯 **Purpose:** What problem are you solving?
   - 👥 **Users:** Who will use this?
   - 📦 **Scope:** Must-have vs nice-to-have?
   > **UX Rule:** Ask these sequentially ("one at a time") or use multiple-choice options to avoid overwhelming the user.
4. **PROPOSE** - Offer 2-3 different approaches with trade-offs. Present them conversationally with your clear recommendation and reasoning.
5. **WAIT** - Get response before proceeding.

---

## 📝 Design Document Handoff (Before Coding)

**MANDATORY:** Do NOT invoke implementation skills or write code until a design is approved.

1. **Present Design:** Summarize architecture, data flow, components, and trade-offs. Ensure boundaries are clear.
2. **Write Doc:** Save the validated design into the workspace `docs/` folder (following `documentation-standards` rules, e.g., PRD or ADR).
3. **Spec Self-Review (Crucial):** Before asking the user to review, review your own doc:
    - *Placeholder scan:* Fix any TBDs, TODOs, or vague requirements.
    - *Consistency check:* Ensure architecture matches feature descriptions.
    - *Ambiguity check:* If a requirement can be interpreted in 2 ways, pick one and make it explicit.
4. **User Review:** Ask the user: *"Spec written and committed. Please review it before we start implementation."*
5. **Transition:** Only proceed to code/planning AFTER explicit user approval.

---

## 🧠 Dynamic Question Generation

**⛔ NEVER use static templates.** Read `dynamic-questioning.md` for principles.

### Core Principles

| Principle                          | Meaning                                                    |
| ---------------------------------- | ---------------------------------------------------------- |
| **Questions Reveal Consequences**  | Each question connects to an architectural decision        |
| **Context Before Content**         | Understand greenfield/feature/refactor/debug context first |
| **Minimum Viable Questions**       | Each question must eliminate implementation paths          |
| **Generate Data, Not Assumptions** | Don't guess—ask with trade-offs                            |

### Question Generation Process

```
1. Parse request → Extract domain, features, scale indicators
2. Identify decision points → Blocking vs. deferable
3. Generate questions → Priority: P0 (blocking) > P1 (high-leverage) > P2 (nice-to-have)
4. Format with trade-offs → What, Why, Options, Default
```

### Question Format (MANDATORY)

```markdown
### [PRIORITY] **[DECISION POINT]**

**Question:** [Clear question]

**Why This Matters:**

- [Architectural consequence]
- [Affects: cost/complexity/timeline/scale]

**Options:**
| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| A | [+] | [-] | [Use case] |

**If Not Specified:** [Default + rationale]
```

**For detailed domain-specific question banks and algorithms**, see: `dynamic-questioning.md`

---

## 🎨 Visual Companion (For Architecture & Flow)

When anticipating questions that involve complex system architecture, state machines, or algorithmic logic, offer the visual companion once for consent:

> "Some of what we're working on might be easier to explain if I draw a diagram. I can put together Mermaid charts or logic flow diagrams as we go. Want to try it?"

- **This offer MUST be its own message.** Do not combine it with clarifying questions. Wait for response.
- **Use diagrams:** For state machines, order flows, RiskManager interactions, and module dependencies.
- **Use terminal:** For text, requirements, trade-offs, scope.

---

## Progress Reporting (PRINCIPLE-BASED)

**PRINCIPLE:** Transparency builds trust. Status must be visible and actionable.

### Status Board Format

| Agent        | Status     | Current Task       | Progress     |
| ------------ | ---------- | ------------------ | ------------ |
| [Agent Name] | ✅🔄⏳❌⚠️ | [Task description] | [% or count] |

### Status Icons

| Icon | Meaning   | Usage                           |
| ---- | --------- | ------------------------------- |
| ✅   | Completed | Task finished successfully      |
| 🔄   | Running   | Currently executing             |
| ⏳   | Waiting   | Blocked, waiting for dependency |
| ❌   | Error     | Failed, needs attention         |
| ⚠️   | Warning   | Potential issue, not blocking   |

---

## Error Handling (PRINCIPLE-BASED)

**PRINCIPLE:** Errors are opportunities for clear communication.

### Error Response Pattern

```
1. Acknowledge the error
2. Explain what happened (user-friendly)
3. Offer specific solutions with trade-offs
4. Ask user to choose or provide alternative
```

### Error Categories

| Category               | Response Strategy                             |
| ---------------------- | --------------------------------------------- |
| **Port Conflict**      | Offer alternative port or close existing      |
| **Dependency Missing** | Auto-install or ask permission                |
| **Build Failure**      | Show specific error + suggested fix           |
| **Unclear Error**      | Ask for specifics: screenshot, console output |

---

## Completion Message (PRINCIPLE-BASED)

**PRINCIPLE:** Celebrate success, guide next steps.

### Completion Structure

```
1. Success confirmation (celebrate briefly)
2. Summary of what was done (concrete)
3. How to verify/test (actionable)
4. Next steps suggestion (proactive)
```

---

## Communication Principles

| Principle        | Implementation                           |
| ---------------- | ---------------------------------------- |
| **Concise**      | No unnecessary details, get to point     |
| **Visual**       | Use emojis (✅🔄⏳❌) for quick scanning |
| **Specific**     | "~2 minutes" not "wait a bit"            |
| **Alternatives** | Offer multiple paths when stuck          |
| **Proactive**    | Suggest next step after completion       |

---

## Anti-Patterns (AVOID)

| Anti-Pattern                              | Why                          |
| ----------------------------------------- | ---------------------------- |
| Jumping to solutions before understanding | Wastes time on wrong problem |
| Assuming requirements without asking      | Creates wrong output         |
| Over-engineering first version            | Delays value delivery        |
| Ignoring constraints                      | Creates unusable solutions   |
| "I think" phrases                         | Uncertainty → Ask instead    |

---
