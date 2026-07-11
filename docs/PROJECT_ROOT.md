# RedWave Labs EA Project Root

Master pointer for versioned EA/cBot documentation. Agents read this file to resolve the active docs version.

## Active Document Version

{version}: v1.0

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
