# HANDOFF: {slug}

> Copy file này thành `HANDOFF-{slug}.md` trong cùng thư mục.  
> Bắt buộc khi **đổi persona** qua ranh giới (strategist→dev, tester→dev, …).  
> Cùng persona làm tiếp: không cần handoff mới.

| Field | Value |
| ----- | ----- |
| From persona | algo-strategist \| mql5-expert \| cbot-expert \| ea-tester \| documentation-writer |
| To persona | … |
| Platform | MT5 \| cTrader \| dual \| n/a |
| Mode at handoff | plan \| implement \| review |
| Plan ref | docs/{version}/3-plans/PLAN-….md (nếu có) |
| Session ref | docs/{version}/4-tasks/SESSION.md (nếu có) |
| User approval | Y/N + ngày |
| rwcommon | required \| optional \| forbidden \| n/a |

## Decisions (đã chốt)

- …

## Open questions

- …

## Constraints

- Symbol / TF:
- Risk:
- Prop / session filter (nếu có):
- Broker / filling / netting:

## Files

| Path | Action (add/edit) | Notes |
| ---- | ----------------- | ----- |
| | | |

## Definition of done

- [ ] …
- [ ] Verify profile: `mt5-code` \| `cbot-code` \| `analyze-only` \| `docs-only`

## Evidence (điền lúc implement / review)

- Compile/build: lệnh + kết quả **hoặc** `VERIFY=MANUAL` + checklist
- Logs/reports: path
- Impact: GitNexus / manual callers
