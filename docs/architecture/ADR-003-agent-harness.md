# ADR-003: Agent harness control plane for ea-kit

## Status

**Accepted** (2026-07-11) — full design: [`DESIGN-agent-harness.md`](./DESIGN-agent-harness.md)

## Context

ea-kit ships personas, skills, workflows, and always-on rules. After P0/P1 cleanup, content is more consistent, but the **runtime control model** is still:

- Always-on Socratic Gate before almost any work  
- “Multi-agent” language without durable handoffs  
- Large mandatory skill lists  
- Host-specific tool names and a single-host rules entrypoint
- “Evidence before claims” without a real MT5/cBot verify path  

We need a harness that is portable, low-friction for small tasks, strict for new strategies, and auditable across roles.

## Decision

1. **Modes + personas + file handoffs** are the default multi-role model (not fake multi-process agents). Host subagents are optional adapters from v0.3+, never the source of truth.  
2. **Request classification** selects gate depth and initial mode.  
3. **Skill tiers** (core / on-demand / reference) replace “load every skill in frontmatter.”  
4. **Platform-specific verify profiles** back the Iron Law; manual verify must be labeled, not implied as compile success.  
5. Deliver in **three phases** (v0.1 control loop → v0.2 skills/verify/eval → v0.3 host/doctor/MCP examples).  
6. **Portable core rules language: Vietnamese** (paths/ids English; vendor skills may stay EN), loaded through thin host adapters.
7. **RWCommon is flexible:** required when project already uses the lib (or flag); optional on greenfield with explicit note — not globally mandatory.  
8. **`SESSION.md` only when needed:** `/orchestrate`, multi-day resume, or multi-handoff — not every chat.

## Consequences

### Positive

- Less gate fatigue on bugfixes; still strict on new EAs  
- Auditable strategist → expert → tester flow via `HANDOFF-*.md`  
- Better context budget and host portability over time  
- Clearer definition of “done” per platform  

### Negative / cost

- More rules surface area to maintain  
- Authors must write handoffs on boundary cross  
- Transition period: dual skill frontmatter shapes  
- Full multi-agent parallelism deferred  

### Neutral

- Existing workflows (`/brainstorm`, `/plan`, `/orchestrate`, `/test`) remain entry points; rewired to classifier/modes  

## Alternatives considered

| Alternative | Why rejected (for now) |
| ----------- | ---------------------- |
| True multi-agent mesh as core | Not portable; high ops cost |
| Keep always-on full Socratic | High friction; models skip gates |
| Single mega system prompt | Context blow-up; no structure |
| Verify only via GitNexus | Does not compile MQL5/cBot |

## References

- `docs/architecture/DESIGN-agent-harness.md`  
- `.agents/rules/EA-KIT.md`
- `.agents/workflows/orchestrate.md`  
