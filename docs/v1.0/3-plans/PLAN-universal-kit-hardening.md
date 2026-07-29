# Universal kit hardening

## Goal

Make ea-kit portable across AI hosts while fixing the audited update and policy-consistency defects.

## Tasks

- [x] Define `.agents/rules/EA-KIT.md` as the portable policy source and retain host-specific files only as adapters → Verify: README names one source of truth.
- [x] Replace merge-style CLI updates with staged replacement, safe backup/rollback, and explicit non-interactive consent → Verify: obsolete files disappear and quiet update without `--force` fails.
- [x] Align MQL5/cBot personas with tiered skills and flexible RWCommon policy → Verify: no persona requires native APIs/RWCommon against the core rule.
- [x] Add CLI integration tests and Node runtime metadata → Verify: `npm test` and `npm pack --dry-run` pass.

## Done When

- [x] Installed kits can be used from Codex, Claude Code, Cursor, Gemini, or a generic host without changing the core policy.
- [x] Update behavior is replace-safe and covered by tests.
