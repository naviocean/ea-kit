# Harness evaluation and doctor

## Goal

Make routing contracts testable and make host/project readiness visible from the CLI.

## Tasks

- [x] Add routing fixtures under `.agents/fixtures/harness/` and validate their schema and expected route in `scripts/verify-harness.mjs` → Verify: `npm test` reports every fixture.
- [x] Add `ea-kit doctor` with read-only checks for Node, installation, portable rules, host adapters, platform, and RWCommon → Verify: doctor reports the current project without mutation.
- [x] Add safe `ea-kit link-host <host>` adapter installation with dry-run and explicit `--force` for existing files → Verify: Codex adapter is installed and overwrite is refused by test.
- [x] Document the commands and run `npm test` plus package dry-run → Verify: all checks pass.

## Done When

- [x] The harness has executable route contracts and a portable setup diagnostic.
