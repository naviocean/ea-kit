# RedWave Labs EA Project Root

Master pointer for versioned EA/cBot documentation. Agents read this file to resolve the active docs version.

## Active Document Version

{version}: v1.0

## Kit architecture (ea-kit itself)

| Doc | Purpose |
| --- | ------- |
| [`architecture/DESIGN-agent-harness.md`](./architecture/DESIGN-agent-harness.md) | Agent harness design (control plane) — **v0.1 implemented** |
| [`architecture/ADR-003-agent-harness.md`](./architecture/ADR-003-agent-harness.md) | ADR for harness decision |
| [`architecture/VERIFY-PROFILES.md`](./architecture/VERIFY-PROFILES.md) | Iron Law verify checklists |
| [`v1.0/3-plans/PLAN-agent-harness-v0.1.md`](./v1.0/3-plans/PLAN-agent-harness-v0.1.md) | Plan harness v0.1 (done) |
| [`v1.0/4-tasks/HANDOFF.template.md`](./v1.0/4-tasks/HANDOFF.template.md) | Cross-persona handoff template |
| [`v1.0/4-tasks/SESSION.template.md`](./v1.0/4-tasks/SESSION.template.md) | Session map template |

## Layout (see `documentation-standards` skill)

```text
docs/
├── PROJECT_ROOT.md
├── v1.0/
│   ├── 1-prds/
│   ├── 2-architecture/
│   ├── 3-plans/
│   ├── 4-tasks/
│   └── 5-reports/
└── architecture/          # Global ADRs
```

## Agent Ownership

| Area | Agent |
| ---- | ----- |
| PRDs & plans | `algo-strategist` |
| Architecture notes | `mql5-expert` / `cbot-expert` |
| Backtest reports | `ea-tester` |
| README / ADR polish | `documentation-writer` (explicit request only) |

When starting a new major EA revision, bump `{version}` (e.g. `v1.1`) and update this file first.
