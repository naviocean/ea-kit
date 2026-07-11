# PLAN: Agent harness v0.1

## Goal

Implement the **control loop** from `docs/architecture/DESIGN-agent-harness.md` (classifier, modes, handoff template, platform verify profiles, workflow rewire) — markdown/rules only; no doctor CLI yet.

## Preconditions

- [x] Design doc approved (`DESIGN-agent-harness.md` → Accepted)  
- [x] §12 locked: rules **VI**; RWCommon **flexible (D10)**; SESSION **conditional (D11)**; subagents **modes-first (D12)**; prop-firm deferred  

## Tasks

- [x] Task 1: GEMINI.md tiếng Việt + classifier/modes/D10–D12  
- [x] Task 2: HANDOFF.template.md + SESSION.template.md  
- [x] Task 3: Workflows orchestrate/plan/test/brainstorm rewired  
- [x] Task 4: brainstorming skill softened  
- [x] Task 5: VERIFY-PROFILES.md  
- [x] Task 6: verify-kit.mjs harness checks  
- [x] Task 7: README + workflows README  

## Done when

- [x] Design status → Implemented harness v0.1  
- [x] `npm test` passes  
- [x] Classifier table in GEMINI covers trivial / bugfix / orchestrate  

## Out of scope (v0.2+)

Skill tier YAML in all agents, fixtures runner, `ea-kit doctor`, host adapters, MCP example merge.
