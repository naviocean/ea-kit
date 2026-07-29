# Design: ea-kit Agent Harness

| Field | Value |
| ----- | ----- |
| Status | **Implemented harness v0.1** (control loop shipped) |
| Version | 0.1.2 |
| Date | 2026-07-11 |
| Owners | RedWave Labs EA team |
| Related | Harness review (session), P0/P1 kit cleanup, `ADR-003-agent-harness.md` |
| Scope | **ea-kit control plane** (rules, modes, skills, workflows, MCP, verify) — not a trading strategy EA |
| Language | Always-on rules & harness docs for agents: **Tiếng Việt** (code identifiers / file paths keep English) |

---

## 1. Problem

ea-kit today is strong as a **policy + knowledge pack** (RWCommon, personas, domain skills) but weak as an **agent control plane**:

1. **Multi-agent is cosplay** — personas and `/orchestrate` claim “invoke agents” without a real handoff runtime or enforceable mode switch.
2. **Gate stack is overloaded** — Socratic Gate on every request + brainstorm “design must be committed” + plan + orchestrate checkpoints conflict and create friction (or learned non-compliance).
3. **“Lazy skills” is aspirational** — agents list 5–8 skills as mandatory; large vendor trees (`mql-developer`, `ctrader-mcp-servers`) blow context.
4. **Host-coupled (resolved)** — portable core rules now use capabilities; Gemini, Codex, Claude, and Cursor use thin adapters.
5. **Iron Law has no teeth** — “must compile/test before claiming done” with no MT5/cBot verify path in the kit.
6. **MCP surface is incomplete** — only GitNexus in `mcp_config.json`; cTrader skill exists but is not wired as kit MCP.

P0/P1 fixed consistency, naming, graceful GitNexus, and static `npm test`. They did **not** redesign the harness.

---

## 2. Goals

| ID | Goal |
| -- | ---- |
| G1 | Every user request is **classified** before heavy gate or coding. |
| G2 | Work proceeds through explicit **modes** (`intake` → `plan` → `implement` → `review` → `done`), not fake multi-process agents. |
| G3 | Cross-role work uses **file handoffs** (durable artifacts), not chat memory alone. |
| G4 | Skills load in **tiers** (core vs on-demand) with a hard context budget. |
| G5 | Rules are **host-portable** via adapters; tools described by capability, not vendor names only. |
| G6 | Completion claims require a **platform verify path** (real command or honest manual checklist). |
| G7 | Kit health is observable: `doctor` + eval fixtures + existing structural `npm test`. |

## 3. Non-goals

| Non-goal | Why |
| -------- | --- |
| Building a full multi-agent orchestration product | Out of scope; hosts differ. Prefer modes + handoffs; optional host subagents later. |
| Replacing MetaTrader / cTrader IDEs | Kit guides agents; does not reimplement terminals. |
| Rewriting all vendor skills in v0.1 | Slim load policy first; content rewrite later. |
| Guaranteeing model compliance 100% | Harness raises compliance probability; cannot cryptographically enforce LLM behavior. |
| Live trading automation as default | cTrader MCP remains opt-in high-risk. |

---

## 4. Current architecture (as-is)

```text
User → (host) → portable EA-KIT rules (via host adapter)
              → optional /workflow markdown ($ARGUMENTS)
              → “apply persona” in same context
              → MUST read long skill lists
              → tools / optional GitNexus MCP
              → claim done (verify often undefined)
```

**Strengths:** domain boundaries, RWCommon policy, plan/orchestrate intent, GitNexus graceful fallback (P1).

**Weaknesses:** no classifier, no durable mode state, no handoff schema, skill explosion, host lock-in, empty verify loop.

---

## 5. Target architecture (to-be)

```text
                    ┌──────────────────────┐
                    │  ea-kit doctor / CLI │  (health, link-host)
                    └──────────┬───────────┘
                               │
User message ──► Host adapter (rules linked)
                               │
                    ┌──────────▼───────────┐
                    │  Request classifier  │  → RequestClass
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
         Gate profile    Mode transition    Skill plan
         (by class)      (state machine)    (tier load)
                               │
                    ┌──────────▼───────────┐
                    │  Persona (role)      │  single context OK
                    │  + HANDOFF files     │  multi-role work
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Tools by capability │  read/edit/run/search/graph
                    │  MCP: gitnexus (+opt)│
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Verify profile      │  MT5 | cBot | docs | skip
                    │  Evidence before claim│
                    └──────────────────────┘
```

**Principle:** Prefer **deterministic control structure** (classify, mode, artifacts, verify) over pretending many agents run in parallel.

---

## 6. Design decisions

### D1 — Modes over multi-agent processes (default)

**Decision:** Default runtime is **one agent context** with:

- Active **persona** (from routing matrix)
- Active **mode**
- Optional **handoff files** when the role boundary would otherwise be violated

True host subagents (Claude Task, etc.) are an **optional adapter**, not the core model.

**Rationale:** Portable across hosts; artifacts are auditable; avoids fake “agent_count ≥ 2” theater.

### D2 — Request classes drive gates

**Decision:** Introduce `RequestClass` before Socratic depth.

| Class | Examples | Gate profile | Default mode after gate |
| ----- | -------- | ------------ | ----------------------- |
| `trivial` | Rename var, comment, typo, magic number one-liner | Optional 1-line confirm; no 3-question ritual | `implement` |
| `bugfix` | Error 10016, wrong SL, compile error | Confirm repro + impact; no full PRD | `implement` or `review` if report-driven |
| `analyze` | Read journal / Strategy Tester HTML | No design doc; tester persona | `review` |
| `strategy` | New EA logic, new entry rules | Full Socratic (symbol, TF, risk, edge) | `plan` |
| `feature` | Trailing module, session filter | Scope + constraints; plan if multi-file | `plan` or `implement` |
| `orchestrate` | “Build full EA end-to-end” | Plan-only first; user Y/N | `plan` → (approve) → `implement` → `review` |
| `docs` | README, ADR polish | Explicit docs only | `implement` (docs persona) |
| `meta` | Kit itself, harness, rules | Skip trading Socratic | `implement` |

**Change to GEMINI:** Replace “every request → 3 sequential questions before ANY tool” with **class-based** rules. Tools allowed for `analyze`/`trivial` without full gate.

### D3 — Mode state machine

```text
                    ┌─────────┐
                    │ intake  │  classify + gate
                    └────┬────┘
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
       ┌────────┐  ┌──────────┐  ┌─────────┐
       │  plan  │  │implement │  │ review  │
       └───┬────┘  └────┬─────┘  └────┬────┘
           │            │             │
           │     user approve*        │
           └──────────►│◄─────────────┘
                       ▼
                  ┌─────────┐
                  │  done   │  verify evidence recorded
                  └─────────┘
```

\* `plan` → `implement` requires explicit user approval **only** for classes `strategy` | `orchestrate` | multi-file `feature`. Not for `trivial` | most `bugfix`.

**Mode persistence (recommended):**

- Soft: state in agent working memory + stated in reply header  
- Hard (khi D11 bắt buộc): `docs/{version}/4-tasks/SESSION.md` + `last_handoff` trỏ `HANDOFF-*.md`

### D4 — Handoff artifact contract

**Path:** `docs/{version}/4-tasks/HANDOFF-{slug}.md`  
(Use `docs/PROJECT_ROOT.md` for `{version}`.)

**Minimum sections:**

```markdown
# HANDOFF: {slug}

| Field | Value |
| From persona | algo-strategist | mql5-expert | cbot-expert | ea-tester | … |
| To persona | … |
| Platform | MT5 | cTrader | dual | n/a |
| Mode at handoff | plan | implement | review |
| Plan ref | docs/.../3-plans/PLAN-….md (if any) |
| User approval | Y/N/date |

## Decisions (locked)
- …

## Open questions
- …

## Constraints
- Risk, symbol, TF, prop rules, RWCommon required? …

## Files
| Path | Action | Notes |
| … | add/edit | … |

## Definition of done
- [ ] …

## Evidence (filled by implement/review)
- Compile/build: command + result or MANUAL checklist
- Tests/logs: paths
```

**Rules:**

- Crossing a **hard domain boundary** (e.g. strategist → code, tester findings → expert fix) **requires** a handoff file (or an existing approved PLAN that already contains the same fields).
- Same-persona multi-step work does not need handoff spam.

### D5 — Skill tiers

| Tier | When loaded | Examples |
| ---- | ----------- | -------- |
| **T0 Global** | Always-on via rules (short); do not re-read full skill every turn | Gate classifier summary, completion iron law, platform checklist pointer |
| **T1 Persona core** | When persona activates; **max 2 full SKILL.md** | e.g. mql5-expert: `mql5-clean-code` + `rwcommon-library-patterns` |
| **T2 On-demand** | Only if task keywords / errors match | `mql5-indicator-patterns`, `ea-debugging-patterns`, `mt5-to-cbot-migration` |
| **T3 Reference** | Open **one** file under `references/` — never bulk-read the tree | `mql-developer/references/…`, ctrader quirks |

**Agent frontmatter change (conceptual):**

```yaml
skills:
  core: [mql5-clean-code, rwcommon-library-patterns]
  on_demand:
    - when: indicator|buffer|OnCalculate
      skills: [mql5-indicator-patterns]
    - when: 10016|4756|journal|log
      skills: [ea-debugging-patterns]
  reference_index: mql-developer   # index only
```

**Strategist:** collapse product-requirements / requirements-* into a short **trading-requirements** skill over time (v0.2+); until then mark two of three as on-demand.

### D6 — Host adapters & tool capabilities

**Capabilities (portable names):**

| Capability | Meaning |
| ---------- | ------- |
| `read` | Read file |
| `edit` | Write / patch file |
| `search` | Grep/glob/text search |
| `exec` | Shell / compile |
| `web` | Web search/fetch |
| `graph` | GitNexus-like code graph |
| `mcp.*` | Named MCP tools |

**Host map (documented in rules, not hard-coded only to Antigravity):**

| Capability | Antigravity-ish | Claude Code | Cursor | Grok-style |
| ---------- | --------------- | ----------- | ------ | ---------- |
| read | view_file | Read | read_file | read_file |
| edit | write/replace | Edit/Write | apply_patch | search_replace |
| search | grep_search | Grep | grep | grep |
| exec | run_command | Bash | shell | run_terminal_command |
| graph | mcp_gitnexus_* | MCP gitnexus | MCP | MCP / search_tool |

**Adapters (files generated or maintained):**

| Host | Artifact |
| ---- | -------- |
| Gemini / Antigravity | `.agents/rules/GEMINI.md` compatibility adapter → `EA-KIT.md` |
| Codex | root `AGENTS.md` / `.agents/adapters/codex/AGENTS.md` → `EA-KIT.md` |
| Claude Code | root `CLAUDE.md` / `.agents/adapters/claude/CLAUDE.md` → `EA-KIT.md` |
| Cursor | `.agents/adapters/cursor/ea-kit.mdc` → `EA-KIT.md` |
| Generic | `.agents/rules/EA-KIT.md` directly |

CLI: `ea-kit link-host <name>` (v0.3) writes/updates adapter stubs.

### D7 — Platform-specific completion (Iron Law)

Replace single MT5-only checklist with **profiles**:

| Profile | When | Must pass before “done” |
| ------- | ---- | ------------------------ |
| `mt5-code` | `.mq5`/`.mqh` edits | ArraySetAsSeries where needed; **RWCommon theo policy flexible (D10)**; error codes; pip/point; **compile evidence** |
| `cbot-code` | cBot C# | cbot-clean-code; PipSize/time rules; **build evidence** if tooling present |
| `analyze-only` | `/test`, log read | Findings written; no compile required |
| `docs-only` | documentation-writer | Paths under `docs/` standards |
| `kit-meta` | editing ea-kit itself | `npm test` |

**Compile evidence:**

1. If `METAEDITOR_PATH` / project script exists → run and paste result.  
2. Else → run **manual checklist** and state: `VERIFY=MANUAL` (must not claim “compiled successfully”).

Kit provides: `docs/architecture/VERIFY-PROFILES.md` (or section below) + optional `scripts/verify-project.mjs` stub that prints checklist by platform.

### D8 — MCP control plane

| Server | Kit default | Notes |
| ------ | ----------- | ----- |
| `gitnexus` | On (existing) | Graceful DEGRADED already |
| cTrader MCP | **Opt-in** documented | Merge pattern into `mcp_config.example.json`; never silent live trading |
| MT5 compile | Out of band | Document env scripts; not necessarily MCP |

`mcp_config.json` remains minimal safe default; examples live beside it.

### D9 — Evaluation harness

| Layer | What | When |
| ----- | ---- | ---- |
| Structural | `npm test` / `verify-kit.mjs` | Already (P1) |
| Contract | Agent core/on_demand schema valid | v0.2 |
| Fixtures | `fixtures/harness/*.json` — prompt → expected class, persona, mode, max skills | v0.2 |
| Doctor | Rules present, version manifest, MCP ping optional | v0.3 |

Fixture example:

```json
{
  "id": "bug-10016",
  "prompt": "EA rejects SL on XAUUSD with 10016",
  "expect": {
    "class": "bugfix",
    "persona": "mql5-expert",
    "mode": "implement",
    "skills_max": ["mql5-clean-code", "rwcommon-library-patterns", "ea-debugging-patterns"],
    "gate": "light"
  }
}
```

### D10 — RWCommon policy (flexible, not always)

**Decision (owner):** Không mặc định “mọi MT5 code phải RWCommon”.

**Detection order (agent MUST follow):**

1. Project có `Include/RWCommon/` **hoặc** `#include <RWCommon/...>` / `#include <RWCommon.mqh>` trong tree → **`RWCOMMON=required`** cho trade/risk/trailing paths.  
2. Project có flag/doc rõ (vd. `docs/PROJECT_ROOT.md` hoặc README: `rwcommon: true|false`) → theo flag.  
3. Greenfield / không có lib → **`RWCOMMON=optional`**:  
   - Prefer introduce RWCommon **nếu** user đồng ý hoặc plan đã chọn.  
   - Cho phép native `CTrade` / order API với **ghi chú tường minh** trong code/handoff: lý do không dùng RWCommon, error handling vẫn bắt buộc (10016, 4756, stops level, pip/point).  
4. User nói rõ “dùng native only” / “bắt buộc RWCommon” → override detection.

**Completion (`mt5-code` profile):**

| RWCOMMON | Pass criteria |
| -------- | ------------- |
| `required` | Trade path qua RWCommon modules; không `OrderSend` raw trừ gap đã document |
| `optional` | Error handling + pip/point + stops; RWCommon không bắt buộc |
| `forbidden` (user) | Native only; vẫn đủ risk/stops handling |

### D11 — `SESSION.md` (khi nào bắt buộc)

**Decision (proposal locked):** Không luôn luôn. Chỉ khi state cần sống **qua nhiều turn / nhiều mode / nhiều persona**.

| Tình huống | `SESSION.md`? | Ghi chú |
| ---------- | ------------- | ------- |
| `trivial`, `bugfix` 1 file, `analyze` report | **Không** | Header harness trong chat đủ |
| `/plan` single-shot, xong trong 1 session | **Không** | Chỉ cần `PLAN-*.md` |
| `/orchestrate` full lifecycle | **Có** | Tạo/cập nhật khi vào orchestrate |
| Multi-day / resume “tiếp tục EA X” | **Có** | Tạo nếu chưa có; đọc lại khi resume |
| ≥2 handoff hoặc đổi mode plan→implement→review | **Có** (nên) | Tránh mất context |

**Path:** `docs/{version}/4-tasks/SESSION.md` (một file “active session” per project version; ghi đè có chủ đích, hoặc archive `SESSION-{slug}.md` nếu song song 2 epic).

**Nội dung tối thiểu:**

```markdown
# SESSION

| Field | Value |
| class | orchestrate | feature | … |
| mode | plan | implement | review |
| persona | … |
| platform | MT5 | cTrader |
| plan | docs/…/PLAN-….md |
| last_handoff | docs/…/HANDOFF-….md |
| rwcommon | required | optional | forbidden |
| updated | ISO-8601 |
```

**Quy tắc:** HANDOFF = ranh giới persona; SESSION = “bản đồ session đang chạy”. Không spam SESSION cho mọi câu chat.

### D12 — Subagents (host spawn)

**Decision (proposal locked):**

| Phase | Policy |
| ----- | ------ |
| **v0.1 – v0.2** | **Modes + persona + HANDOFF only.** Không phụ thuộc host subagent API. |
| **v0.3+ (optional)** | Adapter “spawn if available” — **không** đổi contract artifact. |

**Vì sao modes-first:**

1. Portable (Claude / Cursor / Grok / Antigravity khác nhau về Task/subagent).  
2. Handoff file đã là single source of truth — subagent chỉ là *cách chạy*, không phải *nguồn sự thật*.  
3. Tránh orchestrate “đếm agent_count” giả.

**Khi nào được spawn (sau này, optional):**

- Host có tool subagent/Task **và** mode = `implement` hoặc `review` **và**  
- Đã có PLAN approved hoặc HANDOFF với DoD rõ **và**  
- Spawn prompt **bắt buộc embed** path PLAN/HANDOFF + class/mode/platform (không chỉ “làm giúp đoạn này”).

**Cấm:** Spawn song song strategist + expert cùng lúc chỉnh cùng file; spawn khi chưa classify/gate xong cho class `strategy`/`orchestrate`.

---

## 7. Workflow mapping (keep, rewire)

| Workflow | Classifier class | Modes |
| -------- | ---------------- | ----- |
| `/brainstorm` | `strategy` | intake → plan (options, no code) |
| `/plan` | `strategy` / `feature` | intake → plan → (stop for approval) |
| `/orchestrate` | `orchestrate` | full machine + handoffs |
| `/test` | `analyze` | review (tester); handoff to expert if fix requested |

Workflow markdown: keep `$ARGUMENTS` for Antigravity; adapters document equivalents (`$1`, user text, etc.).

---

## 8. File-level impact (implementation map)

| Path | Change type |
| ---- | ----------- |
| `.agents/rules/EA-KIT.md` | Portable classifier, modes, skill tiers, capabilities, platform verify profiles |
| `.agents/skills/gitnexus-intelligence/` | Keep graceful (done); align wording with modes |
| `.agents/skills/brainstorming/SKILL.md` | Scope to `strategy`/`feature`; remove web error categories; drop “committed” hard requirement → “saved under docs/” |
| `.agents/agents/*.md` | `skills.core` / `on_demand`; portable tools note |
| `.agents/workflows/*.md` | Class + mode + handoff requirements |
| `docs/.../4-tasks/HANDOFF.template.md` | Template |
| `docs/architecture/VERIFY-PROFILES.md` | Checklists |
| `scripts/verify-kit.mjs` | Extend for skill-tier schema + fixtures |
| `scripts/verify-project.mjs` | Optional project checklist runner |
| `bin/cli.js` | Later: `doctor`, `link-host` |
| `.agents/mcp_config.example.json` | Opt-in servers |
| Host adapters | `AGENTS.md` template, `.cursor/rules` template |

---

## 9. Phased delivery

### Phase Harness v0.1 — Control loop (minimal viable harness)

**Intent:** Fix gate + mode + handoff without big CLI/MCP work.

| # | Deliverable | Verify |
| - | ----------- | ------ |
| 1 | Classifier + gate profiles in `GEMINI.md` | Doc review; fixtures draft |
| 2 | Mode machine + reply header convention (`Class` / `Mode` / `Persona`) | Same |
| 3 | `HANDOFF.template.md` + orchestrate/plan/test rewired to require it on boundary cross | Workflow markdown review |
| 4 | Platform completion profiles (MT5 vs cBot vs analyze) in GEMINI | Checklist present |
| 5 | Soften brainstorming for non-strategy classes | No “always 3 questions” on trivial |

**Exit criteria:** A `bugfix` prompt must not require full PRD; an `orchestrate` new EA still requires plan + Y/N + handoff to implement.

### Phase Harness v0.2 — Skills + verify + eval

| # | Deliverable | Verify |
| - | ----------- | ------ |
| 1 | Agent frontmatter skill tiers; update `verify-kit.mjs` | `npm test` green |
| 2 | Slim load instructions; reference_index policy for mql-developer | Manual spot-check context |
| 3 | VERIFY profiles doc + optional project verify stub | File exists; dry-run |
| 4 | `fixtures/harness/*` + runner (even if advisory) | Script exits 0 on fixtures |

### Phase Harness v0.3 — Portability + ops

| # | Deliverable | Verify |
| - | ----------- | ------ |
| 1 | Host adapter templates + README section | Install on 2 hosts documented |
| 2 | `ea-kit doctor` | CLI runs, reports missing rules/MCP |
| 3 | `ea-kit link-host` | Writes adapter file |
| 4 | MCP example config (cTrader opt-in) | Documented only; default safe |

---

## 10. Risks & mitigations

| Risk | Mitigation |
| ---- | ---------- |
| Models ignore classifier | Put class table early in always-on rules; short; fixtures for regression |
| Handoff fatigue | Only on persona boundary / orchestrate; template copy-paste small |
| Skill tier YAML breaks hosts | Support both legacy `skills: [list]` and new shape during transition |
| Manual verify used as loophole | Require explicit `VERIFY=MANUAL` + checklist items ticked |
| Over-design | v0.1 is markdown-only control; no new heavy runtime |

---

## 11. Success metrics

| Metric | Target |
| ------ | ------ |
| Trivial change path | ≤1 clarifying question, no PLAN file required |
| New EA path | PLAN + user Y/N before code |
| Skill files fully read on simple bugfix | ≤3 SKILL.md |
| Fake “compiled OK” without evidence | Forbidden by rules; fixtures flag |
| Host install | Documented path for ≥2 hosts after v0.3 |
| Structural tests | `npm test` remains green |

---

## 12. Quyết định đã chốt (owner)

| # | Câu hỏi | Quyết định |
| - | ------- | ---------- |
| 1 | Ngôn ngữ rules always-on | **Tiếng Việt** (dễ đọc team). Tên file, identifier, skill id, path giữ English. Skill vendor EN giữ nguyên; tóm tắt/trigger tiếng Việt ở portable core khi cần. |
| 2 | RWCommon | **Flexible — không always.** Xem **D10** (detect lib/flag → required; greenfield → optional + note). |
| 3 | `SESSION.md` | **Có điều kiện — không always.** Xem **D11** (orchestrate, multi-day, multi-handoff). |
| 4 | Subagents | **Modes + HANDOFF là core.** Spawn host chỉ optional v0.3+. Xem **D12**. |
| 5 | Prop-firm skill | **Deferred** — không chặn v0.1; cân nhắc T2 skill ở v0.2 nếu team cần. |

### Tóm tắt đề xuất Q3 / Q4 (chi tiết trong D11–D12)

**SESSION.md — “bản đồ session”, không phải nhật ký mọi tin nhắn**

- Mặc định **tắt** cho bug nhỏ / đọc report / 1-shot plan.  
- **Bật** khi: `/orchestrate`, resume nhiều ngày, hoặc đã có ≥2 handoff / đổi mode lớn.  
- Luôn trỏ tới PLAN + last HANDOFF + `rwcommon` mode — agent resume không phụ thuộc chat history.

**Subagents — “máy chạy”, không phải “nguồn sự thật”**

- v0.1 implement **không** viết logic “phải spawn 2 process”.  
- Orchestrate = đổi **mode/persona** + file HANDOFF; nếu host *có* subagent sau này, chỉ bọc cùng artifact.  
- Tránh phụ thuộc sớm vào API riêng từng IDE.

---

## 13. Approval

| Role | Sign-off |
| ---- | -------- |
| Kit owner | ✅ Decisions 1–4 locked (2026-07-11); design accepted for v0.1 |
| Notes | Rules VI; RWCommon flexible; SESSION conditional; subagents deferred |

**Next:** implement **Harness v0.1** (section 9 + plan `docs/v1.0/3-plans/PLAN-agent-harness-v0.1.md`). Re-approve before v0.2.

---

## Appendix A — Reply header convention (v0.1)

Agent mở đầu phần làm việc chính (tiếng Việt + key kỹ thuật):

```markdown
🎛️ **Harness:** class=`bugfix` · mode=`implement` · persona=`mql5-expert` · platform=`MT5` · rwcommon=`required|optional|forbidden`
```

Tuỳ chọn: `handoff=docs/v1.0/4-tasks/HANDOFF-….md` · `session=docs/v1.0/4-tasks/SESSION.md`

## Appendix B — Mapping review IDs → design

| Review ID | Design section |
| --------- | -------------- |
| H-A Classifier/gates | D2, Phase v0.1 |
| H-B Modes + handoff | D1, D3, D4 |
| H-C Skill tiers | D5, Phase v0.2 |
| H-D Host adapters | D6, Phase v0.3 |
| H-E Verify path | D7, Phase v0.2 |
| H-F MCP plane | D8, Phase v0.3 |
| H-G Eval fixtures | D9, Phase v0.2 |
| H-H doctor CLI | Phase v0.3 |
| H-I Platform checklists | D7, Phase v0.1 |
