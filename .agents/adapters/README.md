# Host adapters

The portable policy lives in [`../rules/EA-KIT.md`](../rules/EA-KIT.md). Load that file as the always-on project rule, then use the adapter suitable for the host.

After `ea-kit init`, install an adapter safely with `ea-kit link-host <codex|claude|cursor|gemini>`. Use `--dry-run` to preview and `--force` only when replacing an existing host rule file.

| Host | Setup |
| --- | --- |
| Codex / compatible agents | Copy or link `codex/AGENTS.md` to the project root as `AGENTS.md`. |
| Claude Code | Copy or link `claude/CLAUDE.md` to the project root as `CLAUDE.md`. |
| Cursor | Copy `cursor/ea-kit.mdc` to `.cursor/rules/ea-kit.mdc`. |
| Gemini / Antigravity | Add `rules/GEMINI.md` to always-on project rules; it delegates to the portable core. |
| Other hosts | Add the contents or a file reference to `rules/EA-KIT.md` as project instructions. |

Adapters only specify how a host discovers the core file. They must not introduce host-only tool names or override the core policy.
