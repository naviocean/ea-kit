# Orchestrated delivery flow

## Goal

Make `/orchestrate` enforce discovery, approved PRD, PLAN and tasks, implementation, and an evidence-backed code-audit release gate.

## Tasks

- [x] Add PRD, task, and audit templates under versioned docs paths → Verify: verifier requires each template.
- [x] Rewrite `/orchestrate` as Discovery → Design → Implement → Code Audit with explicit approval checkpoints → Verify: every phase names its required artifact and owner.
- [x] Extend `ea-tester` and portable core rules with audit finding severity and release decisions → Verify: audit output requires approve or changes requested.
- [x] Update workflow docs and structural assertions, then run `npm test` → Verify: suite passes.

## Done When

- [x] One `/orchestrate` invocation defines the complete, auditable EA/cBot delivery lifecycle.
