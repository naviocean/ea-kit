---
description: Vòng đời EA/cBot khép kín: discovery -> PRD -> plan/tasks -> implement -> code audit.
---

# /orchestrate — Delivery lifecycle EA / cBot

$ARGUMENTS

---

**Harness:** class=`orchestrate` · mode bắt đầu=`plan` · cần `SESSION.md`

```
DISCOVERY → PRD approved → PLAN + TASKS approved → IMPLEMENT → CODE AUDIT → DONE
```

## Nguyên tắc

1. Một conversation; đổi persona/mode có chủ đích. Mỗi ranh giới strategist → dev hoặc dev → reviewer cần `HANDOFF-*.md` hoặc PLAN có đủ cùng thông tin.
2. Dùng `docs/{version}/4-tasks/SESSION.md`; đọc `{version}` từ `docs/PROJECT_ROOT.md`.
3. Với strategy/orchestrate, hỏi Socratic **một câu P0 mỗi lượt**, chờ đáp án rồi mới hỏi tiếp.
4. Không có approval thì không chuyển từ Discovery/Design sang Implement. Không có audit decision `approve` thì không `done`.
5. Xác định `rwcommon=` theo `rules/EA-KIT.md`: required | optional | forbidden.

| Platform | Developer | Review profile |
| -------- | --------- | -------------- |
| MT5 / `.mq5` / RWCommon | `mql5-expert` | `mt5-code` |
| cBot / cAlgo / cTrader | `cbot-expert` | `cbot-code` |
| Dual / migration | `cbot-expert` + relevant dev | both as applicable |

## Phase 1 — DISCOVERY

**Persona:** `algo-strategist` · **Mode:** `plan`

1. Làm rõ edge, regime, symbol/TF, risk, prop constraints và no-trade conditions theo Socratic tuần tự.
2. Đưa options, trade-offs và recommendation.
3. Ghi `docs/{version}/1-prds/PRD-{slug}.md` từ `PRD.template.md` với rules testable và acceptance criteria.
4. Cập nhật SESSION với PRD path và trạng thái `discovery-complete`.

### Checkpoint A

```
✅ PRD đã lưu: docs/{version}/1-prds/PRD-{slug}.md
Bạn chấp thuận ý tưởng/rules này để lập kế hoạch triển khai? (Y/N)
```

## Phase 2 — DESIGN

**Persona:** `algo-strategist` · **Mode:** `plan`

1. Ghi `docs/{version}/3-plans/PLAN-{slug}.md`: module/files, RWCommon decision, dependencies, verify profile, DoD.
2. Tạo một hoặc nhiều `docs/{version}/4-tasks/TASK-{slug}.md` từ `TASK.template.md`; mỗi task có owner, scope, acceptance criteria và HANDOFF ref.
3. Ghi HANDOFF strategist → developer với PRD, PLAN, TASK paths, platform, risk constraints và user approval.
4. Cập nhật SESSION với plan/task/handoff path và mode `plan`.

### Checkpoint B

```
✅ PLAN và TASKS đã lưu.
Bạn approve để implement theo artifacts này? (Y/N)
```

## Phase 3 — IMPLEMENT

**Persona:** `mql5-expert` hoặc `cbot-expert` · **Mode:** `implement`

1. Implement đúng PRD/PLAN/TASK/HANDOFF; không thêm strategy rule chưa duyệt.
2. Cập nhật từng TASK status và SESSION mode `implement`.
3. Thu evidence theo profile: compile/build hoặc `VERIFY=MANUAL`; manual impact search hoặc graph.
4. Khi ready, tạo HANDOFF developer → `ea-tester` gồm diff/files, evidence, risks và audit scope.

## Phase 4 — CODE AUDIT & RELEASE GATE

**Persona:** `ea-tester` · **Mode:** `review`

1. Review PRD/PLAN/TASK đối chiếu với diff: correctness, risk, broker/API constraints, error handling, test coverage và maintainability.
2. Kiểm tra platform profile (`mt5-code` / `cbot-code`) và evidence compile/build hoặc `VERIFY=MANUAL`.
3. Ghi `docs/{version}/5-reports/AUDIT-{slug}.md` từ `AUDIT.template.md`, với findings 🔴 blocking / 🟡 important / 🟢 nit, evidence và impact.
4. Release decision:
   - **✅ Approve:** không còn blocking và đủ evidence → TASK done, SESSION `mode=done`.
   - **🔄 Changes requested:** ghi HANDOFF tester → developer, SESSION quay lại `implement`; không claim done.

## Output

```markdown
## 🎼 Delivery Report

### Artifacts
- PRD: docs/{version}/1-prds/PRD-…
- PLAN: docs/{version}/3-plans/PLAN-…
- TASKS: docs/{version}/4-tasks/TASK-…
- AUDIT: docs/{version}/5-reports/AUDIT-…

### Release decision
✅ Approve | 🔄 Changes requested

### Evidence
- verify_profile=…
- compile/build or VERIFY=MANUAL: …
- tests/report/impact: …
```
