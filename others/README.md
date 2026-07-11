# `others/` — Legacy / non-shipped scratch

This directory is **not** part of the published **ea-kit** package.

| Fact | Detail |
| ---- | ------ |
| **Source of truth** | Always `.agents/` at the repo root |
| **npm package** | `package.json` → `files` only includes `.agents` and `bin` |
| **gitignore** | Root `.gitignore` may ignore `others` for local clones; treat as disposable |
| **Contents** | Old web-kit / Antigravity leftovers (partial skills, monorepo rules, unused scripts) |

## Rules

1. Do **not** copy agents or skills from `others/` into projects.
2. Do **not** reference `others/` from workflows or `GEMINI.md`.
3. Prefer deleting obsolete trees here over “fixing later.”
4. If you need something from history, recover it from git — not from this folder as a live dependency.

## Safe cleanup

```bash
# Optional: remove entirely if you do not need local scratch
rm -rf others
```

After removal, `npm test` (kit verify) should still pass.
